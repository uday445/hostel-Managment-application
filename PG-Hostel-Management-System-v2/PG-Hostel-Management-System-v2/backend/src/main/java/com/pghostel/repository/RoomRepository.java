package com.pghostel.repository;

import com.pghostel.entity.Room;
import com.pghostel.entity.SharingType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findBySharingType(SharingType sharingType);
    boolean existsByRoomNumber(String roomNumber);
}
