package com.paf.vaas.role;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "roles")
public class Role {

    @Id
    private String id;

    private RoleName name;

    protected Role() {
    }

    public Role(RoleName name) {
        this.name = name;
    }

    public String getId() {
        return id;
    }

    public RoleName getName() {
        return name;
    }

    public void setName(RoleName name) {
        this.name = name;
    }
}
