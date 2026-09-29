package com.pghostel.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

@Entity
@Table(name = "hostel_fees")
public class HostelFee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @NotNull
    @Min(0)
    private Double amount;

    @NotNull
    private LocalDate dueDate;

    private LocalDate paidDate;

    private String status = "PENDING";

    private String paymentFile;

    public HostelFee() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Candidate getCandidate() { return candidate; }
    public void setCandidate(Candidate candidate) { this.candidate = candidate; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public LocalDate getPaidDate() { return paidDate; }
    public void setPaidDate(LocalDate paidDate) { this.paidDate = paidDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPaymentFile() { return paymentFile; }
    public void setPaymentFile(String paymentFile) { this.paymentFile = paymentFile; }
}
