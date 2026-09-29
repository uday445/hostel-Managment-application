package com.pghostel.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

@Entity
@Table(name = "candidates")
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    @NotBlank
    private String phone;

    @Email
    private String email;

    private String gender;

    @Column(length = 1000)
    private String address;

    @Column(name = "id_proof_file")
    private String idProofFile;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_id")
    private Room room;

    private LocalDate admissionDate;

    private Boolean active = true;

    public Candidate() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getIdProofFile() { return idProofFile; }
    public void setIdProofFile(String idProofFile) { this.idProofFile = idProofFile; }

    public Room getRoom() { return room; }
    public void setRoom(Room room) { this.room = room; }

    public LocalDate getAdmissionDate() { return admissionDate; }
    public void setAdmissionDate(LocalDate admissionDate) { this.admissionDate = admissionDate; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
