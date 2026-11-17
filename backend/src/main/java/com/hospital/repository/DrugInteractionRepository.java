package com.hospital.repository;

import com.hospital.entity.DrugInteraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DrugInteractionRepository extends JpaRepository<DrugInteraction, Long> {

    @Query("SELECT di FROM DrugInteraction di WHERE di.active = true AND " +
           "(di.medicationA.id IN :medIds AND di.medicationB.id IN :medIds)")
    List<DrugInteraction> findInteractionsBetween(@Param("medIds") List<Long> medIds);

    List<DrugInteraction> findByActiveTrue();
}
