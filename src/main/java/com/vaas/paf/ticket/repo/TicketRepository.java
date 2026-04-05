package com.vaas.paf.ticket.repo;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.vaas.paf.ticket.model.TicketDocument;

public interface TicketRepository extends MongoRepository<TicketDocument, String> {

	List<TicketDocument> findByReporterId(String reporterId);

	List<TicketDocument> findByAssignedTechnicianId(String assignedTechnicianId);
}
