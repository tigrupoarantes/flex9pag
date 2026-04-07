-- Adicionar FKs circulares após criação das tabelas
ALTER TABLE services
  ADD CONSTRAINT fk_services_nfse
    FOREIGN KEY (nfse_id) REFERENCES nfse_invoices(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_services_payment_link
    FOREIGN KEY (payment_link_id) REFERENCES payment_links(id) ON DELETE SET NULL;
