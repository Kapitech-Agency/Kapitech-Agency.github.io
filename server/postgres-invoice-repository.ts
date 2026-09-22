import { getPostgresPool, withPostgresTransaction } from './postgres.ts';

type Row = Record<string, any>;
const obj=(v:unknown):Record<string,unknown>=>v&&typeof v==='object'?v as Record<string,unknown>:{};
const iso=(v:Date|string)=>v instanceof Date?v.toISOString():new Date(v).toISOString();
const date=(v:unknown)=>v==null?'':v instanceof Date?v.toISOString().slice(0,10):String(v).slice(0,10);

function mapInvoice(row:Row, items:Row[], payments:Row[]):any {
  const metadata=obj(row.metadata);
  const mappedPayments=payments.map(p=>({
    id:p.id, amount:Number(p.amount), date:date(p.paid_at), method:p.method,
    reference:p.reference||'', recordedBy:obj(metadata.paymentUsers)[p.id] || obj(p.metadata).recordedBy || '',
    notes:obj(p.metadata).notes || ''
  }));
  const amountPaid=Number(row.amount_paid||mappedPayments.reduce((s,p)=>s+p.amount,0));
  const total=Number(row.total||0);
  return {...metadata,id:row.id,invoiceNumber:row.invoice_number,clientId:row.client_id??'',
    projectId:row.project_id??'',type:row.type||'invoice',items:items.map(i=>({
      id:i.id,description:i.description,quantity:Number(i.quantity),unitPrice:Number(i.unit_price),amount:Number(i.amount??Number(i.quantity)*Number(i.unit_price))
    })),subtotal:Number(row.subtotal||0),discountPercent:Number(row.discount_percent||0),
    discountAmount:Number(row.discount_amount||0),taxPercent:Number(row.tax_percent||0),taxAmount:Number(row.tax_amount||0),
    total,amountPaid,balanceDue:Math.max(0,total-amountPaid),currency:row.currency,status:row.status,
    issueDate:date(row.issue_date),dueDate:date(row.due_date),notes:row.notes||'',paymentTerms:row.payment_terms||'',
    payments:mappedPayments,auditTrail:Array.isArray(metadata.auditTrail)?metadata.auditTrail:[],
    createdAt:iso(row.created_at),updatedAt:iso(row.updated_at)};
}
function metadata(i:any){const {id,invoiceNumber,clientId,projectId,type,items,subtotal,discountPercent,discountAmount,taxPercent,taxAmount,total,amountPaid,balanceDue,currency,status,issueDate,dueDate,notes,paymentTerms,payments,auditTrail,createdAt,updatedAt,...rest}=i;return {...rest,auditTrail};}

export class PostgresInvoiceRepository {
  private async items(db:any,id:string){const r=await db.query('SELECT * FROM invoice_items WHERE invoice_id=$1 ORDER BY id ASC',[id]);return r.rows as Row[];}
  private async payments(db:any,id:string){const r=await db.query('SELECT * FROM invoice_payments WHERE invoice_id=$1 ORDER BY paid_at DESC, id DESC',[id]);return r.rows as Row[];}
  async list():Promise<any[]>{const db=getPostgresPool();const r=await db.query('SELECT * FROM invoices ORDER BY created_at DESC');const ir=await db.query('SELECT * FROM invoice_items ORDER BY id ASC');const pr=await db.query('SELECT * FROM invoice_payments ORDER BY paid_at DESC, id DESC');const im=new Map<string,Row[]>(),pm=new Map<string,Row[]>();for(const x of ir.rows){const a=im.get(x.invoice_id)||[];a.push(x);im.set(x.invoice_id,a)}for(const x of pr.rows){const a=pm.get(x.invoice_id)||[];a.push(x);pm.set(x.invoice_id,a)}return r.rows.map((x:Row)=>mapInvoice(x,im.get(x.id)||[],pm.get(x.id)||[]));}
  async findById(id:string):Promise<any|null>{const db=getPostgresPool();const r=await db.query('SELECT * FROM invoices WHERE id=$1',[id]);if(!r.rows[0])return null;return mapInvoice(r.rows[0],await this.items(db,id),await this.payments(db,id));}
  async create(i:any):Promise<any>{return withPostgresTransaction(async db=>{
      const clientId = i.clientId ? String(i.clientId) : null;
      const projectId = i.projectId ? String(i.projectId) : null;
      if (clientId) {
        const client = await db.query('SELECT id FROM clients WHERE id=$1 LIMIT 1',[clientId]);
        if (!client.rows[0]) throw new Error('Client not found.');
      }
      if (projectId) {
        const project = await db.query('SELECT id, client_id FROM projects WHERE id=$1 LIMIT 1',[projectId]);
        if (!project.rows[0]) throw new Error('Project not found.');
        if (clientId && project.rows[0].client_id && String(project.rows[0].client_id) !== clientId) {
          throw new Error('Project does not belong to the selected client.');
        }
      }
      await db.query('INSERT INTO invoices (id,invoice_number,client_id,project_id,type,subtotal,discount_percent,discount_amount,tax_percent,tax_amount,total,amount_paid,balance_due,currency,status,issue_date,due_date,notes,payment_terms,metadata,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)',[i.id,i.invoiceNumber,clientId,projectId,i.type||'invoice',i.subtotal,i.discountPercent||0,i.discountAmount||0,i.taxPercent||0,i.taxAmount||0,i.total,0,i.total,i.currency||'IDR',i.status||'draft',i.issueDate||null,i.dueDate||null,i.notes||null,i.paymentTerms||null,JSON.stringify(metadata(i)),i.createdAt,i.updatedAt]);for(const x of i.items||[])await db.query('INSERT INTO invoice_items (id,invoice_id,description,quantity,unit_price,amount) VALUES ($1,$2,$3,$4,$5,$6)',[x.id,i.id,x.description,x.quantity,x.unitPrice,x.amount??Number(x.quantity)*Number(x.unitPrice)]);return this.findByIdTx(db,i.id);});}
  private async findByIdTx(db:any,id:string){const r=await db.query('SELECT * FROM invoices WHERE id=$1',[id]);if(!r.rows[0])return null;return mapInvoice(r.rows[0],await this.items(db,id),await this.payments(db,id));}
  async update(id:string,patch:any):Promise<any|null>{return withPostgresTransaction(async db=>{const r=await db.query('SELECT * FROM invoices WHERE id=$1 FOR UPDATE',[id]);if(!r.rows[0])return null;const current=mapInvoice(r.rows[0],await this.items(db,id),await this.payments(db,id));if(current.status==='cancelled'&&patch.status&&patch.status!=='cancelled')throw new Error('Cancelled invoices cannot be reopened.');if(patch.updatedAt&&current.updatedAt!==patch.updatedAt)throw new Error('Invoice has been modified since it was loaded. Refresh and retry.');const next={...current,...patch,id,updatedAt:new Date().toISOString()};
      const nextClientId = next.clientId ? String(next.clientId) : null;
      const nextProjectId = next.projectId ? String(next.projectId) : null;
      if (nextClientId) {
        const client = await db.query('SELECT id FROM clients WHERE id=$1 LIMIT 1',[nextClientId]);
        if (!client.rows[0]) throw new Error('Client not found.');
      }
      if (nextProjectId) {
        const project = await db.query('SELECT id, client_id FROM projects WHERE id=$1 LIMIT 1',[nextProjectId]);
        if (!project.rows[0]) throw new Error('Project not found.');
        if (nextClientId && project.rows[0].client_id && String(project.rows[0].client_id) !== nextClientId) {
          throw new Error('Project does not belong to the selected client.');
        }
      }
      next.clientId=nextClientId; next.projectId=nextProjectId;
      if (current.payments.length > 0 && (nextClientId !== String(current.clientId || '') || nextProjectId !== String(current.projectId || ''))) throw new Error('PAID_INVOICE_LINKAGE_IMMUTABLE');
      if (current.payments.length > 0 && Number(next.total) !== Number(current.total)) throw new Error('PAID_INVOICE_TOTAL_IMMUTABLE');
      if (current.payments.length > 0) {
        const protectedFinancialFields = ['subtotal','discountPercent','discountAmount','taxPercent','taxAmount','currency'];
        if (protectedFinancialFields.some((key)=>patch[key]!==undefined && String(patch[key])!==String((current as any)[key]))) {
          throw new Error('PAID_INVOICE_FINANCIAL_FIELDS_IMMUTABLE');
        }
      }
      if (current.payments.length > 0 && patch.items !== undefined) {
        const currentItems = JSON.stringify(current.items.map((x:any)=>({id:x.id,description:x.description,quantity:Number(x.quantity),unitPrice:Number(x.unitPrice),amount:Number(x.amount)})));
        const nextItems = JSON.stringify((next.items || []).map((x:any)=>({id:x.id,description:x.description,quantity:Number(x.quantity),unitPrice:Number(x.unitPrice),amount:Number(x.amount ?? Number(x.quantity)*Number(x.unitPrice)}))));
        if (currentItems !== nextItems) throw new Error('PAID_INVOICE_ITEMS_IMMUTABLE');
      }
      const paid=next.payments.reduce((s:any,p:any)=>s+Number(p.amount||0),0);if(Number(next.total)<paid)throw new Error('Invoice total cannot be lower than payments already recorded.');next.amountPaid=paid;next.balanceDue=Math.max(0,Number(next.total)-paid);if(patch.status==='paid'&&!(next.balanceDue===0&&next.total>0))throw new Error('Invoice can only be marked paid after the remaining balance is fully settled.');if(patch.status==='partially_paid'&&!(paid>0&&next.balanceDue>0))throw new Error('Invoice can only be partially paid when a payment has been recorded and a balance remains.');if(next.balanceDue<=0&&next.total>0)next.status='paid';else if(paid>0)next.status='partially_paid';await db.query('UPDATE invoices SET invoice_number=$2,client_id=$3,project_id=$4,type=$5,subtotal=$6,discount_percent=$7,discount_amount=$8,tax_percent=$9,tax_amount=$10,total=$11,amount_paid=$12,balance_due=$13,currency=$14,status=$15,issue_date=$16,due_date=$17,notes=$18,payment_terms=$19,metadata=$20,updated_at=$21 WHERE id=$1',[id,current.invoiceNumber,next.clientId||null,next.projectId||null,next.type,next.subtotal,next.discountPercent,next.discountAmount,next.taxPercent,next.taxAmount,next.total,paid,next.balanceDue,next.currency,next.status,next.issueDate||null,next.dueDate||null,next.notes||null,next.paymentTerms||null,JSON.stringify(metadata(next)),next.updatedAt]);if(patch.items!==undefined){await db.query('DELETE FROM invoice_items WHERE invoice_id=$1',[id]);for(const x of next.items||[])await db.query('INSERT INTO invoice_items (id,invoice_id,description,quantity,unit_price,amount) VALUES ($1,$2,$3,$4,$5,$6)',[x.id,id,x.description,x.quantity,x.unitPrice,x.amount??Number(x.quantity)*Number(x.unitPrice)])}return this.findByIdTx(db,id);});}
  async recordPayment(id:string,payment:any):Promise<any|null>{return withPostgresTransaction(async db=>{const r=await db.query('SELECT * FROM invoices WHERE id=$1 FOR UPDATE',[id]);if(!r.rows[0])return null;const current=mapInvoice(r.rows[0],await this.items(db,id),await this.payments(db,id));
    if (payment.idempotencyKey) {
      const duplicate = await db.query("SELECT id FROM invoice_payments WHERE invoice_id=$1 AND metadata->>'idempotencyKey'=$2 LIMIT 1",[id,String(payment.idempotencyKey)]);
      if (duplicate.rows[0]) return this.findByIdTx(db,id);
    }
    if(current.status==='cancelled')throw new Error('Cancelled invoices cannot receive payments.');if(Number(payment.amount)<=0||Number(payment.amount)>current.balanceDue)throw new Error('Payment exceeds the current invoice balance.');await db.query('INSERT INTO invoice_payments (id,invoice_id,amount,paid_at,method,reference,metadata) VALUES ($1,$2,$3,$4,$5,$6,$7)',[payment.id,id,payment.amount,payment.date,payment.method,payment.reference||null,JSON.stringify({recordedBy:payment.recordedBy||payment.userId||'system',notes:payment.notes||'',idempotencyKey:payment.idempotencyKey||undefined})]);const totalPaid=current.amountPaid+Number(payment.amount),balance=Math.max(0,current.total-totalPaid),status=balance<=0?'paid':'partially_paid';const audit=[...current.auditTrail,{action:'payment_recorded',timestamp:new Date().toISOString(),user:payment.recordedBy||payment.userId||'system',note:payment.reference||payment.notes||''}];await db.query('UPDATE invoices SET amount_paid=$2,balance_due=$3,status=$4,metadata=$5,updated_at=$6 WHERE id=$1',[id,totalPaid,balance,status,JSON.stringify({...metadata(current),auditTrail:audit}),new Date().toISOString()]);return this.findByIdTx(db,id);});}
  async cancel(id:string,user:string):Promise<any|null>{return withPostgresTransaction(async db=>{const r=await db.query('SELECT * FROM invoices WHERE id=$1 FOR UPDATE',[id]);if(!r.rows[0])return null;const current=mapInvoice(r.rows[0],await this.items(db,id),await this.payments(db,id));if(current.status==='cancelled')return current;const audit=[...current.auditTrail,{action:'cancelled',timestamp:new Date().toISOString(),user}];await db.query('UPDATE invoices SET status=$2,metadata=$3,updated_at=$4 WHERE id=$1',[id,'cancelled',JSON.stringify({...metadata(current),auditTrail:audit}),new Date().toISOString()]);return this.findByIdTx(db,id);});}
  async delete(id:string){return this.cancel(id,'system');}
}
export const postgresInvoiceRepository=new PostgresInvoiceRepository();
