package com.devagent.security;

public class DevAgentPrincipal {
    private final String uid;
    private final String email;

    public DevAgentPrincipal(String uid, String email) {
        this.uid = uid;
        this.email = email;
    }

    public String getUid() { return uid; }
    public String getEmail() { return email; }
}
