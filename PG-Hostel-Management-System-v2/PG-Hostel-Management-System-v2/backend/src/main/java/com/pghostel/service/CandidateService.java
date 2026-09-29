package com.pghostel.service;

import com.pghostel.entity.Candidate;
import com.pghostel.entity.Room;
import com.pghostel.repository.CandidateRepository;
import com.pghostel.repository.RoomRepository;
import jakarta.transaction.Transactional;
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
public class CandidateService {

    private final CandidateRepository candidateRepository;
    private final RoomRepository roomRepository;
    private final RoomService roomService;

    public CandidateService(CandidateRepository candidateRepository,
                            RoomRepository roomRepository,
                            RoomService roomService) {
        this.candidateRepository = candidateRepository;
        this.roomRepository = roomRepository;
        this.roomService = roomService;
    }

    public List<Candidate> getAll() {
        return candidateRepository.findAll();
    }

    public Candidate getById(Long id) {
        return candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
    }

    @Transactional
    public Candidate create(Candidate candidate, Long roomId,
                            MultipartFile idProof) throws IOException {

        candidate.setAdmissionDate(
                candidate.getAdmissionDate() == null
                        ? LocalDate.now()
                        : candidate.getAdmissionDate()
        );

        if (roomId == null) {
            throw new RuntimeException("Please select a room.");
        }

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        roomService.incrementOccupied(room);
        candidate.setRoom(room);

        if (idProof != null && !idProof.isEmpty()) {
            candidate.setIdProofFile(saveFile(idProof, "idproof"));
        }

        return candidateRepository.save(candidate);
    }

    @Transactional
    public Candidate update(Long id, Candidate input, Long roomId,
                            MultipartFile idProof) throws IOException {

        Candidate existing = getById(id);

        existing.setName(input.getName());
        existing.setPhone(input.getPhone());
        existing.setEmail(input.getEmail());
        existing.setGender(input.getGender());
        existing.setAddress(input.getAddress());
        existing.setAdmissionDate(input.getAdmissionDate());
        existing.setActive(input.getActive());

        if (roomId == null) {
            if (existing.getRoom() != null) {
                roomService.decrementOccupied(existing.getRoom());
                existing.setRoom(null);
            }
        } else {
            Long oldRoomId = existing.getRoom() == null
                    ? null
                    : existing.getRoom().getId();

            if (!roomId.equals(oldRoomId)) {
                Room newRoom = roomRepository.findById(roomId)
                        .orElseThrow(() -> new RuntimeException("Room not found"));

                roomService.incrementOccupied(newRoom);

                if (existing.getRoom() != null) {
                    roomService.decrementOccupied(existing.getRoom());
                }

                existing.setRoom(newRoom);
            }
        }

        if (idProof != null && !idProof.isEmpty()) {
            existing.setIdProofFile(saveFile(idProof, "idproof"));
        }

        return candidateRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        Candidate candidate = getById(id);

        if (candidate.getRoom() != null) {
            roomService.decrementOccupied(candidate.getRoom());
        }

        candidateRepository.delete(candidate);
    }

    private String saveFile(MultipartFile file, String folder) throws IOException {
        String original = file.getOriginalFilename();
        String extension = "";

        if (original != null && original.contains(".")) {
            extension = original.substring(original.lastIndexOf("."));
        }

        String fileName = UUID.randomUUID() + extension;
        Path directory = Path.of("uploads", folder);
        Files.createDirectories(directory);

        Files.copy(
                file.getInputStream(),
                directory.resolve(fileName),
                StandardCopyOption.REPLACE_EXISTING
        );

        return "/uploads/" + folder + "/" + fileName;
    }
}
