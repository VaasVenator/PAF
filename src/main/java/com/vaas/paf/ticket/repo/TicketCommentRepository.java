package com.vaas.paf.ticket.repo;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.vaas.paf.ticket.model.TicketCommentDocument;

public interface TicketCommentRepository extends MongoRepository<TicketCommentDocument, String> {

	List<TicketCommentDocument> findByTicketIdOrderByCreatedAtAsc(String ticketId);
}
