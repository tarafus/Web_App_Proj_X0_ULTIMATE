// service/EloService.java
package com.web_app.proj.backend.service;

import org.springframework.stereotype.Service;

@Service
public class EloService {

    private static final int K = 32;
    private static final int MIN_ELO = 100;

    /**
     * Calcule la variation d'ELO pour le gagnant et le perdant.
     * @return int[]{deltaWinner, deltaLoser}
     */
    public int[] calculate(int winnerElo, int loserElo) {
        double expected = 1.0 / (1 + Math.pow(10, (loserElo - winnerElo) / 400.0));
        int delta = (int) Math.round(K * (1 - expected));
        return new int[]{ delta, -delta };
    }

    public int applyMin(int currentElo, int delta) {
        return Math.max(MIN_ELO, currentElo + delta);
    }
}