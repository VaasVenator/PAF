package com.vaas.paf.resource.dto;

import java.time.LocalTime;
import java.util.List;

import com.vaas.paf.resource.model.ResourceStatus;
import com.vaas.paf.resource.model.ResourceType;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateResourceRequest(
		@NotBlank(message = "Resource name is required.") String name,
		@NotNull(message = "Resource type is required.") ResourceType type,
		@NotNull(message = "Capacity is required.") @Min(value = 1, message = "Capacity must be at least 1.") Integer capacity,
		@NotBlank(message = "Location is required.") String location,
		@NotNull(message = "Availability start time is required.") LocalTime availabilityStart,
		@NotNull(message = "Availability end time is required.") LocalTime availabilityEnd,
		@NotNull(message = "Resource status is required.") ResourceStatus status,
		List<String> amenities) {
}
