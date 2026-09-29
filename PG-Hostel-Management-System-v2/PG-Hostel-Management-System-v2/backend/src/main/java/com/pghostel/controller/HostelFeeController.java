package com.pghostel.controller;

import com.pghostel.entity.HostelFee;
import com.pghostel.service.HostelFeeService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/fees")
@CrossOrigin(origins = "http://localhost:5173")
public class HostelFeeController {

    private final HostelFeeService service;

    public HostelFeeController(HostelFeeService service) {
        this.service = service;
    }

    @GetMapping
    public List<HostelFee> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public HostelFee getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public ResponseEntity<HostelFee> create(
            @RequestBody HostelFee fee,
            @RequestParam Long candidateId
    ) {
        return ResponseEntity.ok(service.create(fee, candidateId));
    }

    @PostMapping(value = "/{id}/payment",
                 consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<HostelFee> uploadPayment(
            @PathVariable Long id,
            @RequestPart("payment") MultipartFile payment
    ) throws IOException {
        return ResponseEntity.ok(service.uploadPayment(id, payment));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
