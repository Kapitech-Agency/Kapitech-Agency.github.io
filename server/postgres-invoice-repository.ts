      const year = new Date().getFullYear();
      const invoiceNumber = 'INV-KAPI-' + year + '-' + crypto.randomInt(1000, 1000000);
      const metadata = {
        clientName: obj(proposalRow.metadata).clientName,
        clientCompany: obj(proposalRow.metadata).company,
        sourceProposalNumber: proposalRow.proposal_number,
        convertedByUserId: actorUserId
      };

      const invoiceId = 'inv_' + crypto.randomUUID();
      const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const inserted = await client.query<Row>(
        'INSERT INTO invoices ' +
        '(id,invoice_number,client_id,project_id,type,subtotal,discount_percent,discount_amount,tax_percent,tax_amount,total,amount_paid,balance_due,currency,status,issue_date,due_date,notes,payment_terms,source_proposal_id,version,metadata,created_at,updated_at) ' +
        'VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,0,$11,$12,$13,$14,$15,$16,$17,$18,1,$19,NOW(),NOW()) RETURNING *',
        [
          invoiceId,
          invoiceNumber,
          proposalRow.client_id ?? null,
          proposalRow.project_id ?? null,
          'invoice',
          Number(proposalRow.subtotal || 0),
          Number(proposalRow.discount || 0),
          Number(proposalRow.discount || 0),
          Number(proposalRow.tax_percent || 0),
          Number(proposalRow.tax || 0),
          Number(proposalRow.total || 0),
          proposalRow.currency || 'IDR',
          'draft',
          new Date().toISOString().slice(0, 10),
          dueDate,
          proposalRow.notes || null,
          proposalRow.payment_terms || null,
          proposalId,