package com.devagent.goals.dto;

import jakarta.validation.constraints.Min;

public class LogProgressRequest {
    @Min(1)
    private int minutes;

    public int getMinutes() { return minutes; }
    public void setMinutes(int minutes) { this.minutes = minutes; }
}
