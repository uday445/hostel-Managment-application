package com.pghostel.service;

import com.pghostel.entity.Candidate;
import com.pghostel.entity.HostelFee;
import com.pghostel.repository.CandidateRepository;
import com.pghostel.repository.HostelFeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class HostelFeeService {

    private final HostelFeeRepository feeRepository;
    private final CandidateRepository candidateRepository;

    public HostelFeeService(HostelFeeRepository feeRepository,
                            CandidateRepository candidateRepository) {
        this.feeRepository = feeRepository;
        this.candidateRepository = candidateRepository;
    }

    public List<HostelFee> getAll() {
        return feeRepository.findAll();
    }

    public HostelFee getById(Long id) {
        return feeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fee record not found"));
    }

    public HostelFee create(HostelFee fee, Long candidateId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        fee.setCandidate(candidate);
        fee.setStatus(
                fee.getStatus() == null || fee.getStatus().isBlank()
                        ? "PENDING"
                        : fee.getStatus()
        );

        return feeRepository.save(fee);
    }

    public HostelFee uploadPayment(Long id, MultipartFile payment)
            throws IOException {

        HostelFee fee = getById(id);

        if (payment == null || payment.isEmpty()) {
            throw new RuntimeException("Payment receipt is required.");
        }

        String original = payment.getOriginalFilename();
        String extension = "";

        if (original != null && original.contains(".")) {
            extension = original.substring(original.lastIndexOf("."));
        }

        String fileName = UUID.randomUUID() + extension;
        Path directory = Path.of("uploads", "payments");
        Files.createDirectories(directory);

        Files.copy(
                payment.getInputStream(),
                directory.resolve(fileName),
                StandardCopyOption.REPLACE_EXISTING
        );

        fee.setPaymentFile("/uploads/payments/" + fileName);
        fee.setStatus("PAID");
        fee.setPaidDate(LocalDate.now());

        return feeRepository.save(fee);
    }

    public void delete(Long id) {
        feeRepository.deleteById(id);
    }
}
