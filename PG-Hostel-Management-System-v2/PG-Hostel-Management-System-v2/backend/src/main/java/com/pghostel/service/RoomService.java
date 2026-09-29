package com.pghostel.service;

import com.pghostel.entity.Room;
import com.pghostel.entity.SharingType;
import com.pghostel.repository.RoomRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoomService {

    private final RoomRepository repository;

    public RoomService(RoomRepository repository) {
        this.repository = repository;
    }

    public List<Room> getAll() {
        return repository.findAll();
    }

    public List<Room> getBySharing(SharingType sharingType) {
        return repository.findBySharingType(sharingType);
    }

    public Room getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));
    }

    public Room create(Room room) {
        setCapacity(room);
        room.setOccupied(0);
        updateStatus(room);
        return repository.save(room);
    }

    public Room update(Long id, Room input) {
        Room room = getById(id);

        if (input.getSharingType() == null) {
            throw new RuntimeException("Sharing type is required");
        }

        int newCapacity = getCapacity(input.getSharingType());

        if (room.getOccupied() > newCapacity) {
            throw new RuntimeException(
                    "Cannot reduce sharing type because the room already has "
                            + room.getOccupied() + " occupants."
            );
        }

        room.setRoomNumber(input.getRoomNumber());
        room.setSharingType(input.getSharingType());
        room.setRent(input.getRent());
        room.setCapacity(newCapacity);
        updateStatus(room);

        return repository.save(room);
    }

    public void delete(Long id) {
        Room room = getById(id);

        if (room.getOccupied() > 0) {
            throw new RuntimeException("Cannot delete an occupied room.");
        }

        repository.delete(room);
    }

    @Transactional
    public void incrementOccupied(Room room) {
        Room managed = getById(room.getId());

        if (managed.getOccupied() >= managed.getCapacity()) {
            throw new RuntimeException(
                    managed.getRoomNumber() + " is full. No bed is available."
            );
        }

        managed.setOccupied(managed.getOccupied() + 1);
        updateStatus(managed);
        repository.save(managed);
    }

    @Transactional
    public void decrementOccupied(Room room) {
        Room managed = getById(room.getId());
        managed.setOccupied(Math.max(0, managed.getOccupied() - 1));
        updateStatus(managed);
        repository.save(managed);
    }

    private void setCapacity(Room room) {
        if (room.getSharingType() == null) {
            throw new RuntimeException("Sharing type is required.");
        }
        room.setCapacity(getCapacity(room.getSharingType()));
    }

    private int getCapacity(SharingType type) {
        return switch (type) {
            case ONE -> 1;
            case TWO -> 2;
            case THREE -> 3;
        };
    }

    private void updateStatus(Room room) {
        room.setStatus(
                room.getOccupied() >= room.getCapacity()
                        ? "FULL"
                        : "AVAILABLE"
        );
    }
}
