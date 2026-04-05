package com.vaas.paf.resource.model;

import java.time.LocalTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "resources")
public class ResourceDocument {

	@Id
	private String id;
	private String name;
	private ResourceType type;
	private Integer capacity;
	private String location;
	private LocalTime availabilityStart;
	private LocalTime availabilityEnd;
	private ResourceStatus status;
	private List<String> amenities;
}
