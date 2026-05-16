package com.web_app.proj.backend.dto;

public class AIMoveResponse {

    private int sub;
    private int cell;

    public AIMoveResponse() {}

    public AIMoveResponse(int sub, int cell) {
        this.sub = sub;
        this.cell = cell;
    }

    public int getSub() { return sub; }
    public void setSub(int sub) { this.sub = sub; }

    public int getCell() { return cell; }
    public void setCell(int cell) { this.cell = cell; }
}