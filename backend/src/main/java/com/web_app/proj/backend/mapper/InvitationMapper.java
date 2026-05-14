package com.web_app.proj.backend.mapper;

import com.web_app.proj.backend.dto.InvitationDTO;
import com.web_app.proj.backend.model.Invitation;

public class InvitationMapper {
    public static InvitationDTO toDTO(Invitation inv) {
        return new InvitationDTO(
            inv.getId(),
            inv.getSender().getUsername(),
            inv.getReceiver().getUsername(),
            inv.getStatus().name(),
            inv.getGame() != null ? inv.getGame().getId() : null
        );
    }
}