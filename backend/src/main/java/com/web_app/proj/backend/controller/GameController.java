package com.web_app.proj.backend.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.web_app.proj.backend.dto.GameDTO;
import com.web_app.proj.backend.mapper.GameMapper;
import com.web_app.proj.backend.model.Game;
import com.web_app.proj.backend.service.GameService;

@RestController
@RequestMapping("/game")
@CrossOrigin
public class GameController {

    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    // Créer une partie
    @PostMapping("/create")
    public GameDTO create(@RequestAttribute("username") String username) {
        Game game = gameService.createGame(username);
        return GameMapper.toDTO(game);
    }

    // Rejoindre une partie
    @PostMapping("/join/{id}")
    public GameDTO join(@PathVariable Long id, @RequestAttribute("username") String username) {
        Game game = gameService.joinGame(id, username);
        return GameMapper.toDTO(game);
    }

    // Récupérer une partie
    @GetMapping("/{id}")
    public GameDTO get(@PathVariable Long id) {
        Game game = gameService.getGame(id).orElseThrow();
        return GameMapper.toDTO(game);
    }

    // Mettre à jour l'état (utile pour debug, remplacé par WebSocket ensuite)
    @PostMapping("/{id}/state")
    public GameDTO updateState(@PathVariable Long id, @RequestBody String newState) {
        Game game = gameService.updateState(id, newState);
        return GameMapper.toDTO(game);
    }
}
