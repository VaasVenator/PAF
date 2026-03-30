package com.paf.vaas.resource;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/resources")
public class ResourceController {

    @GetMapping
    public Map<String, String> getResources() {
        return Map.of("message", "Shared resources for authenticated users");
    }

    @GetMapping("/admin")
    public Map<String, String> getAdminResources() {
        return Map.of("message", "Admin resources");
    }

    @GetMapping("/technician")
    public Map<String, String> getTechnicianResources() {
        return Map.of("message", "Technician resources");
    }
}
