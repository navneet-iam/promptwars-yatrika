import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TripForm from "../components/trip-form";

describe("TripForm Accessibility & UI rendering", () => {
  it("should render form fields with accessible names and labels", () => {
    render(<TripForm onSubmit={vi.fn()} isLoading={false} />);

    // Destination Input
    const destinationInput = screen.getByLabelText(
      /Where are you traveling to\?/i,
    );
    expect(destinationInput).toBeInTheDocument();
    expect(destinationInput).toHaveAttribute("type", "text");
    expect(destinationInput).toBeRequired();

    // Duration Input
    const daysInput = screen.getByLabelText(/Trip Duration/i);
    expect(daysInput).toBeInTheDocument();
    expect(daysInput).toHaveAttribute("type", "range");

    // Budget select dropdown
    const budgetSelect = screen.getByLabelText(/Budget Style/i);
    expect(budgetSelect).toBeInTheDocument();
    expect(budgetSelect.tagName).toBe("SELECT");

    // Optional travel-month select
    const monthSelect = screen.getByLabelText(/When are you visiting\?/i);
    expect(monthSelect).toBeInTheDocument();
    expect(monthSelect.tagName).toBe("SELECT");

    // Submit button
    const submitBtn = screen.getByRole("button", {
      name: /Generate Immersive Guide/i,
    });
    expect(submitBtn).toBeInTheDocument();
  });

  it("should display validation error if submitted without destination", async () => {
    const handleSubmitMock = vi.fn();
    render(<TripForm onSubmit={handleSubmitMock} isLoading={false} />);

    const submitBtn = screen.getByRole("button", {
      name: /Generate Immersive Guide/i,
    });
    fireEvent.click(submitBtn);

    // Should show validation error message in UI
    const alert = await screen.findByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert.textContent).toContain("Please specify a destination.");
    expect(handleSubmitMock).not.toHaveBeenCalled();
  });

  it("should display validation error if submitted with destination but no interests selected", async () => {
    const handleSubmitMock = vi.fn();
    render(<TripForm onSubmit={handleSubmitMock} isLoading={false} />);

    const destinationInput = screen.getByLabelText(
      /Where are you traveling to\?/i,
    );
    fireEvent.change(destinationInput, { target: { value: "Jaipur" } });

    const submitBtn = screen.getByRole("button", {
      name: /Generate Immersive Guide/i,
    });
    fireEvent.click(submitBtn);

    // Interests are 0 by default, so it should trigger validation error
    const alert = await screen.findByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert.textContent).toContain(
      "Please select at least one cultural interest.",
    );
    expect(handleSubmitMock).not.toHaveBeenCalled();
  });

  it("should call onSubmit with formatted payload when valid values are entered", () => {
    const handleSubmitMock = vi.fn();
    render(<TripForm onSubmit={handleSubmitMock} isLoading={false} />);

    // Fill Destination
    const destinationInput = screen.getByLabelText(
      /Where are you traveling to\?/i,
    );
    fireEvent.change(destinationInput, { target: { value: "Kyoto" } });

    // Click history interest button
    const historyBtn = screen.getByRole("button", {
      name: /History & Heritage/i,
    });
    fireEvent.click(historyBtn);

    // Submit
    const submitBtn = screen.getByRole("button", {
      name: /Generate Immersive Guide/i,
    });
    fireEvent.click(submitBtn);

    expect(handleSubmitMock).toHaveBeenCalledTimes(1);
    expect(handleSubmitMock).toHaveBeenCalledWith({
      destination: "Kyoto",
      days: 3,
      interests: ["history"],
      budgetStyle: "moderate",
      travelPace: "balanced",
      travelMonth: undefined,
      dietaryPreference: undefined,
      accessibilityNeeds: undefined,
      avoidTouristy: false,
    });
  });

  it("should include the selected travel month in the payload when chosen", () => {
    const handleSubmitMock = vi.fn();
    render(<TripForm onSubmit={handleSubmitMock} isLoading={false} />);

    fireEvent.change(screen.getByLabelText(/Where are you traveling to\?/i), {
      target: { value: "Jaipur" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /History & Heritage/i }),
    );
    fireEvent.change(screen.getByLabelText(/When are you visiting\?/i), {
      target: { value: "October" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /Generate Immersive Guide/i }),
    );

    expect(handleSubmitMock).toHaveBeenCalledTimes(1);
    expect(handleSubmitMock).toHaveBeenCalledWith(
      expect.objectContaining({ destination: "Jaipur", travelMonth: "October" }),
    );
  });

  it("should disable form submit button when isLoading is true", () => {
    render(<TripForm onSubmit={vi.fn()} isLoading={true} />);

    const submitBtn = screen.getByRole("button", {
      name: /Generating Yatrika.../i,
    });
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();
  });
});
