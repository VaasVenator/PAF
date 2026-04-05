package com.vaas.paf.resource.dto;

import java.time.LocalTime;
import java.util.List;

import com.vaas.paf.resource.model.ResourceStatus;
import com.vaas.paf.resource.model.ResourceType;

public record ResourceResponse(
		String id,
		String name,
		ResourceType type,
		Integer capacity,
		String location,
		LocalTime availabilityStart,
		LocalTime availabilityEnd,
		ResourceStatus status,
		List<String> amenities) {
}
