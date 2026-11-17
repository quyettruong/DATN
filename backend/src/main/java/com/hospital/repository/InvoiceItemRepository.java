package com.hospital.repository;

import com.hospital.entity.Invoice;
import com.hospital.entity.InvoiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, Long> {
    List<InvoiceItem> findByInvoice(Invoice invoice);
    List<InvoiceItem> findByInvoiceAndItemType(Invoice invoice, String itemType);
}
