package com.web_app.proj.backend.mapper;

import com.web_app.proj.backend.dto.UserDTO;
import com.web_app.proj.backend.model.User;

public class UserMapper {

    public static UserDTO toDTO(User user) {
        return new UserDTO(
            user.getId(),
            user.getUsername(),
            user.getElo(),
            user.getWins(),
            user.getLosses()
        );
    }
}
