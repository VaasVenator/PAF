package com.vaas.paf.resource.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.vaas.paf.common.AppException;
import com.vaas.paf.resource.dto.CreateResourceRequest;
import com.vaas.paf.resource.dto.ResourceResponse;
import com.vaas.paf.resource.dto.UpdateResourceRequest;
import com.vaas.paf.resource.model.ResourceDocument;
import com.vaas.paf.resource.model.ResourceStatus;
import com.vaas.paf.resource.model.ResourceType;
import com.vaas.paf.resource.repo.ResourceRepository;
import com.vaas.paf.security.AccessGuard;
import com.vaas.paf.security.UserRole;

@Service
public class ResourceService {

	private final ResourceRepository resourceRepository;
	private final AccessGuard accessGuard;

	public ResourceService(ResourceRepository resourceRepository, AccessGuard accessGuard) {
		this.resourceRepository = resourceRepository;
		this.accessGuard = accessGuard;
	}

	public ResourceResponse create(CreateResourceRequest request) {
		accessGuard.requireAnyRole(UserRole.ADMIN);
		validateAvailabilityWindow(request.availabilityStart(), request.availabilityEnd());

		ResourceDocument resource = ResourceDocument.builder()
				.name(request.name())
				.type(request.type())
				.capacity(request.capacity())
				.location(request.location())
				.availabilityStart(request.availabilityStart())
				.availabilityEnd(request.availabilityEnd())
				.status(request.status())
				.amenities(request.amenities() == null ? List.of() : request.amenities())
				.build();

		return toResponse(resourceRepository.save(resource));
	}

	public List<ResourceResponse> findAll(ResourceType type, Integer minCapacity, String location, ResourceStatus status) {
		return resourceRepository.findAll().stream()
				.filter(resource -> type == null || resource.getType() == type)
				.filter(resource -> minCapacity == null || resource.getCapacity() >= minCapacity)
				.filter(resource -> location == null || resource.getLocation().toLowerCase().contains(location.toLowerCase()))
				.filter(resource -> status == null || resource.getStatus() == status)
				.map(this::toResponse)
				.toList();
	}

	public ResourceResponse findById(String id) {
		return toResponse(getDocument(id));
	}

	public ResourceDocument getDocument(String id) {
		return resourceRepository.findById(id)
				.orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Resource not found."));
	}

	public ResourceResponse update(String id, UpdateResourceRequest request) {
		accessGuard.requireAnyRole(UserRole.ADMIN);
		validateAvailabilityWindow(request.availabilityStart(), request.availabilityEnd());

		ResourceDocument resource = getDocument(id);
		resource.setName(request.name());
		resource.setType(request.type());
		resource.setCapacity(request.capacity());
		resource.setLocation(request.location());
		resource.setAvailabilityStart(request.availabilityStart());
		resource.setAvailabilityEnd(request.availabilityEnd());
		resource.setStatus(request.status());
		resource.setAmenities(request.amenities() == null ? List.of() : request.amenities());

		return toResponse(resourceRepository.save(resource));
	}

	public void delete(String id) {
		accessGuard.requireAnyRole(UserRole.ADMIN);
		if (!resourceRepository.existsById(id)) {
			throw new AppException(HttpStatus.NOT_FOUND, "Resource not found.");
		}
		resourceRepository.deleteById(id);
	}

	private void validateAvailabilityWindow(java.time.LocalTime start, java.time.LocalTime end) {
		if (!start.isBefore(end)) {
			throw new AppException(HttpStatus.BAD_REQUEST, "Availability start time must be before end time.");
		}
	}

	private ResourceResponse toResponse(ResourceDocument resource) {
		return new ResourceResponse(
				resource.getId(),
				resource.getName(),
				resource.getType(),
				resource.getCapacity(),
				resource.getLocation(),
				resource.getAvailabilityStart(),
				resource.getAvailabilityEnd(),
				resource.getStatus(),
				resource.getAmenities());
	}
}
