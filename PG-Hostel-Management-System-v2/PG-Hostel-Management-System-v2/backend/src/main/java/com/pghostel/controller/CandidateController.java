package com.pghostel.controller;

import com.pghostel.entity.Candidate;
import com.pghostel.service.CandidateService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/candidates")
@CrossOrigin(origins = "http://localhost:5173")
public class CandidateController {

    private final CandidateService service;

    public CandidateController(CandidateService service) {
        this.service = service;
    }

    @GetMapping
    public List<Candidate> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Candidate getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Candidate> create(
            @RequestPart("candidate") Candidate candidate,
            @RequestParam Long roomId,
            @RequestPart(value = "idProof", required = false) MultipartFile idProof
    ) throws IOException {
        return ResponseEntity.ok(service.create(candidate, roomId, idProof));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Candidate> update(
            @PathVariable Long id,
            @RequestPart("candidate") Candidate candidate,
            @RequestParam(required = false) Long roomId,
            @RequestPart(value = "idProof", required = false) MultipartFile idProof
    ) throws IOException {
        return ResponseEntity.ok(service.update(id, candidate, roomId, idProof));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
