package com.pghostel.controller;

import com.pghostel.entity.Room;
import com.pghostel.entity.SharingType;
import com.pghostel.service.RoomService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "http://localhost:5173")
public class RoomController {

    private final RoomService service;

    public RoomController(RoomService service) {
        this.service = service;
    }

    @GetMapping
    public List<Room> getAll() {
        return service.getAll();
    }

    @GetMapping("/sharing/{sharingType}")
    public List<Room> getBySharing(@PathVariable SharingType sharingType) {
        return service.getBySharing(sharingType);
    }

    @GetMapping("/{id}")
    public Room getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public ResponseEntity<Room> create(@Valid @RequestBody Room room) {
        return ResponseEntity.ok(service.create(room));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Room> update(@PathVariable Long id,
                                       @Valid @RequestBody Room room) {
        return ResponseEntity.ok(service.update(id, room));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
