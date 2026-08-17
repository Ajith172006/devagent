package com.devagent.goals.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class CreateGoalRequest {
    @NotBlank
    @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "date must be YYYY-MM-DD")
    private String date;

    @Min(1)
    private int targetMinutes;

    private String focus;

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public int getTargetMinutes() { return targetMinutes; }
    public void setTargetMinutes(int targetMinutes) { this.targetMinutes = targetMinutes; }
    public String getFocus() { return focus; }
    public void setFocus(String focus) { this.focus = focus; }
}
