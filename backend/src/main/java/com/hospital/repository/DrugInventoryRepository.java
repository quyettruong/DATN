package com.hospital.repository;

import com.hospital.entity.DrugInventory;
import com.hospital.entity.Medication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DrugInventoryRepository extends JpaRepository<DrugInventory, Long> {
    List<DrugInventory> findByMedication(Medication medication);
    List<DrugInventory> findByMedicationAndStockQuantityGreaterThan(Medication medication, Integer qty);
    List<DrugInventory> findByStockQuantityLessThanEqual(Integer reorderLevel);
    
    // We can use native query or JPQL for stock <= reorderLevel over all items if needed.
    // The requirement says: findByStockQuantityLessThanEqual(Integer reorderLevel) but without medication it applies to all.
    // We might need a custom query to compare stockQuantity with reorderLevel for each item.
    @Query("SELECT d FROM DrugInventory d WHERE d.stockQuantity <= d.reorderLevel")
    List<DrugInventory> findLowStock();
    
    List<DrugInventory> findByExpiryDateBefore(LocalDate date);
    
    @Query("SELECT d FROM DrugInventory d WHERE d.medication = :med AND d.stockQuantity > 0 ORDER BY d.expiryDate ASC")
    List<DrugInventory> findAvailableByMedicationOrderByExpiry(@Param("med") Medication medication);
}
