import { getPostgresPool, withPostgresTransaction } from './postgres.ts';

type Row = Record<string, any>;
const iso=(v:Date|string)=>v instanceof Date?v.toISOString():new Date(v).toISOString();
const date=(v:unknown)=>v==null?'':v instanceof Date?v.toISOString().slice(0,10):String(v).slice(0,10);
const obj=(v:unknown):Record<string,unknown>=>v&&typeof v==='object'?v as Record<string,unknown>:{};

function mapProposal(row:Row, itemRows:Row[]):any {
  const metadata=obj(row.metadata);
  return {...metadata,id:row.id,proposalNumber:row.proposal_number,title:row.title,
    clientId:row.client_id??undefined,dealId:row.deal_id??undefined,projectId:row.project_id??undefined,
    subtotal:Number(row.subtotal),discount:Number(row.discount),taxPercent:Number(row.tax_percent),tax:Number(row.tax),
    total:Number(row.total),currency:row.currency,validityPeriod:row.validity_period??'',paymentTerms:row.payment_terms??'',
    owner:row.owner??'',status:row.status,notes:row.notes??'',createdDate:row.created_date?date(row.created_date):undefined,
    sentDate:row.sent_date?date(row.sent_date):undefined,approvedDate:row.approved_date?date(row.approved_date):undefined,
    items:itemRows.map(i=>({id:i.id,description:i.description,quantity:Number(i.quantity),unitPrice:Number(i.unit_price)})),
    createdAt:iso(row.created_at),updatedAt:iso(row.updated_at)};
}
function metadata(p:any){const {id,proposalNumber,title,clientId,dealId,projectId,subtotal,discount,taxPercent,tax,total,currency,validityPeriod,paymentTerms,owner,status,notes,createdDate,sentDate,approvedDate,items,createdAt,updatedAt,...rest}=p;return rest;}

export class PostgresProposalRepository {
  private async items(db:any,id:string){const r=await db.query('SELECT * FROM proposal_items WHERE proposal_id=$1 ORDER BY id ASC',[id]);return r.rows as Row[];}
  async list():Promise<any[]>{const db=getPostgresPool();const r=await db.query('SELECT * FROM proposals ORDER BY created_at DESC');const items=await db.query('SELECT * FROM proposal_items ORDER BY id ASC');const m=new Map<string,Row[]>();for(const i of items.rows){const a=m.get(i.proposal_id)||[];a.push(i);m.set(i.proposal_id,a)}return r.rows.map((x:Row)=>mapProposal(x,m.get(x.id)||[]));}
  async findById(id:string):Promise<any|null>{const db=getPostgresPool();const r=await db.query('SELECT * FROM proposals WHERE id=$1',[id]);if(!r.rows[0])return null;return mapProposal(r.rows[0],await this.items(db,id));}
  async create(p:any):Promise<any>{return withPostgresTransaction(async db=>{
    let resolvedClientId = p.clientId ? String(p.clientId) : null;
    if (resolvedClientId) {
      const client = await db.query('SELECT id FROM clients WHERE id=$1 FOR SHARE',[resolvedClientId]);
      if (!client.rows[0]) throw new Error('Proposal client not found.');
    }
    if (p.projectId) {
      const project = await db.query('SELECT id,client_id FROM projects WHERE id=$1 FOR SHARE',[String(p.projectId)]);
      if (!project.rows[0]) throw new Error('Proposal project not found.');
      const projectClientId = project.rows[0].client_id ? String(project.rows[0].client_id) : null;
      if (projectClientId && resolvedClientId && projectClientId !== resolvedClientId) throw new Error('Proposal project does not belong to the selected client.');
      if (!resolvedClientId && projectClientId) resolvedClientId = projectClientId;
    }
    if (p.dealId) {
      const deal = await db.query('SELECT id,client_id FROM crm_deals WHERE id=$1 FOR SHARE',[String(p.dealId)]);
      if (!deal.rows[0]) throw new Error('Proposal deal not found.');
      const dealClientId = deal.rows[0].client_id ? String(deal.rows[0].client_id) : null;
      if (dealClientId && resolvedClientId && dealClientId !== resolvedClientId) throw new Error('Proposal deal does not belong to the selected client.');
      if (!resolvedClientId && dealClientId) resolvedClientId = dealClientId;
    }
    await db.query(`INSERT INTO proposals (id,proposal_number,title,client_id,deal_id,project_id,subtotal,discount,tax_percent,tax,total,currency,validity_period,payment_terms,owner,status,notes,created_date,sent_date,approved_date,metadata,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)`,[p.id,p.proposalNumber,p.title,resolvedClientId,p.dealId||null,p.projectId||null,p.subtotal,p.discount,p.taxPercent,p.tax,p.total,p.currency,p.validityPeriod||null,p.paymentTerms||null,p.owner||null,p.status,p.notes||null,p.createdDate||null,p.sentDate||null,p.approvedDate||null,JSON.stringify(metadata(p)),p.createdAt,p.updatedAt]);for(const i of p.items||[])await this.insertItem(db,p.id,i);return p;});}
  async update(id:string,patch:any):Promise<any|null>{return withPostgresTransaction(async db=>{const r=await db.query('SELECT * FROM proposals WHERE id=$1 FOR UPDATE',[id]);if(!r.rows[0])return null;const current=mapProposal(r.rows[0],await this.items(db,id)); const next={...current,...patch,id,updatedAt:new Date().toISOString()};
      if (next.clientId) { const x=await db.query('SELECT id FROM clients WHERE id=$1 FOR SHARE',[String(next.clientId)]); if(!x.rows[0])throw new Error('Proposal client not found.'); }
      if (next.projectId) { const x=await db.query('SELECT id,client_id FROM projects WHERE id=$1 FOR SHARE',[String(next.projectId)]); if(!x.rows[0])throw new Error('Proposal project not found.'); if(next.clientId&&x.rows[0].client_id&&String(x.rows[0].client_id)!==String(next.clientId))throw new Error('Proposal project does not belong to the selected client.'); }
      if (next.dealId) { const x=await db.query('SELECT id,client_id FROM crm_deals WHERE id=$1 FOR SHARE',[String(next.dealId)]); if(!x.rows[0])throw new Error('Proposal deal not found.'); if(next.clientId&&x.rows[0].client_id&&String(x.rows[0].client_id)!==String(next.clientId))throw new Error('Proposal deal does not belong to the selected client.'); }
      if (String(r.rows[0].status)==='Accepted') {
        if (patch.status !== undefined && patch.status !== 'Accepted') throw new Error('ACCEPTED_PROPOSAL_IMMUTABLE');
        const protectedFields=['clientId','dealId','projectId','subtotal','discount','taxPercent','tax','total','currency','items'];
        if (protectedFields.some((key)=>patch[key]!==undefined)) throw new Error('ACCEPTED_PROPOSAL_IMMUTABLE');
      }await db.query('UPDATE proposals SET proposal_number=$2,title=$3,client_id=$4,deal_id=$5,project_id=$6,subtotal=$7,discount=$8,tax_percent=$9,tax=$10,total=$11,currency=$12,validity_period=$13,payment_terms=$14,owner=$15,status=$16,notes=$17,created_date=$18,sent_date=$19,approved_date=$20,metadata=$21,updated_at=$22 WHERE id=$1',[id,next.proposalNumber,next.title,next.clientId||null,next.dealId||null,next.projectId||null,next.subtotal,next.discount,next.taxPercent,next.tax,next.total,next.currency,next.validityPeriod||null,next.paymentTerms||null,next.owner||null,next.status,next.notes||null,next.createdDate||null,next.sentDate||null,next.approvedDate||null,JSON.stringify(metadata(next)),next.updatedAt]);if(patch.items!==undefined){await db.query('DELETE FROM proposal_items WHERE proposal_id=$1',[id]);for(const i of next.items||[])await this.insertItem(db,id,i)}return mapProposal((await db.query('SELECT * FROM proposals WHERE id=$1',[id])).rows[0],await this.items(db,id));});}
  async delete(id:string){
    return withPostgresTransaction(async db=>{
      const current=await db.query('SELECT id,status FROM proposals WHERE id=$1 FOR UPDATE',[id]);
      if(!current.rows[0]) return false;
      const status=String(current.rows[0].status||'');
      if(status!=='Draft') throw new Error('PROPOSAL_DELETE_RESTRICTED');
      const result=await db.query('DELETE FROM proposals WHERE id=$1',[id]);
      return result.rowCount===1;
    });
  }
  async approve(id:string):Promise<any|null>{return this.update(id,{status:'Approved',approvedDate:new Date().toISOString().slice(0,10)});}
  async convertToInvoice(id:string):Promise<any|null>{return withPostgresTransaction(async db=>{const r=await db.query('SELECT * FROM proposals WHERE id=$1 FOR UPDATE',[id]);if(!r.rows[0])return null;const p=mapProposal(r.rows[0],await this.items(db,id));
if(p.clientId){const x=await db.query('SELECT id FROM clients WHERE id=$1 FOR SHARE',[p.clientId]);if(!x.rows[0])throw new Error('Proposal client not found.');}
if(p.projectId){const x=await db.query('SELECT id, client_id FROM projects WHERE id=$1 FOR SHARE',[p.projectId]);if(!x.rows[0])throw new Error('Proposal project not found.');if(p.clientId&&x.rows[0].client_id&&String(x.rows[0].client_id)!==String(p.clientId))throw new Error('Proposal project does not belong to the selected client.');}
if(p.dealId){const x=await db.query('SELECT id, client_id FROM crm_deals WHERE id=$1 FOR SHARE',[p.dealId]);if(!x.rows[0])throw new Error('Proposal deal not found.');if(p.clientId&&x.rows[0].client_id&&String(x.rows[0].client_id)!==String(p.clientId))throw new Error('Proposal deal does not belong to the selected client.');}
if(!['Draft','Internal Review','Sent','Approved'].includes(String(p.status)))throw new Error('Proposal cannot be converted to an invoice in its current status.');const now=new Date().toISOString(),issue=now.slice(0,10),due=new Date(Date.now()+14*86400000).toISOString().slice(0,10);let n=`INV-KAPI-${new Date().getFullYear()}-${Math.floor(1000+Math.random()*999000)}`;let exists=await db.query('SELECT 1 FROM invoices WHERE invoice_number=$1',[n]);while(exists.rows[0]){n=`INV-KAPI-${new Date().getFullYear()}-${Math.floor(1000+Math.random()*999000)}`;exists=await db.query('SELECT 1 FROM invoices WHERE invoice_number=$1',[n]);}const invoice={id:`inv_${Date.now()}_${Math.random().toString(16).slice(2,8)}`,invoiceNumber:n,clientId:p.clientId||null,projectId:p.projectId||null,type:'invoice',subtotal:p.subtotal,discountPercent:0,discountAmount:p.discount,taxPercent:p.taxPercent,taxAmount:p.tax,total:p.total,amountPaid:0,balanceDue:p.total,currency:p.currency,status:'draft',issueDate:issue,dueDate:due,notes:`Generated from Proposal ${p.proposalNumber}. Terms: ${p.paymentTerms}`,paymentTerms:p.paymentTerms,createdAt:now,updatedAt:now};await db.query(`INSERT INTO invoices (id,invoice_number,client_id,project_id,type,subtotal,discount_percent,discount_amount,tax_percent,tax_amount,total,amount_paid,balance_due,currency,status,issue_date,due_date,notes,payment_terms,metadata,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)`,[invoice.id,invoice.invoiceNumber,invoice.clientId,invoice.projectId,invoice.type,invoice.subtotal,invoice.discountPercent,invoice.discountAmount,invoice.taxPercent,invoice.taxAmount,invoice.total,0,invoice.balanceDue,invoice.currency,invoice.status,issue,due,invoice.notes,invoice.paymentTerms,'{}',now,now]);for(const i of p.items)await db.query('INSERT INTO invoice_items (id,invoice_id,description,quantity,unit_price,amount) VALUES ($1,$2,$3,$4,$5,$6)',[`ii_${i.id}`,invoice.id,i.description,i.quantity,i.unitPrice,i.quantity*i.unitPrice]);await db.query('UPDATE proposals SET status=$2,updated_at=$3 WHERE id=$1',[id,'Accepted',now]);return {...invoice,items:p.items.map((i:any)=>({id:`ii_${i.id}`,description:i.description,quantity:Number(i.quantity),unitPrice:Number(i.unitPrice),amount:Number(i.quantity)*Number(i.unitPrice)})),payments:[],auditTrail:[]};});}
  private async insertItem(db:any,pid:string,i:any){await db.query('INSERT INTO proposal_items (id,proposal_id,description,quantity,unit_price) VALUES ($1,$2,$3,$4,$5)',[i.id,pid,i.description,i.quantity,i.unitPrice]);}
}
export const postgresProposalRepository=new PostgresProposalRepository();