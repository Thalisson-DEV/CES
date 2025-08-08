package com.sipel.CES.users.auth.exceptions;

public class NoUserInLocalMemoryException extends RuntimeException {
    public NoUserInLocalMemoryException(String message) {
        super(message);
    }
}
