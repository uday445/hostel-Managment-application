package com.pghostel.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "rooms")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "room_number", unique = true, nullable = false)
    private String roomNumber;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "sharing_type", nullable = false)
    private SharingType sharingType;

    @Column(nullable = false)
    private Integer capacity;

    @Column(nullable = false)
    private Integer occupied = 0;

    @NotNull
    @Min(0)
    @Column(nullable = false)
    private Double rent;

    @Column(nullable = false)
    private String status = "AVAILABLE";

    public Room() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public SharingType getSharingType() { return sharingType; }
    public void setSharingType(SharingType sharingType) { this.sharingType = sharingType; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public Integer getOccupied() { return occupied; }
    public void setOccupied(Integer occupied) { this.occupied = occupied; }

    public Double getRent() { return rent; }
    public void setRent(Double rent) { this.rent = rent; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
