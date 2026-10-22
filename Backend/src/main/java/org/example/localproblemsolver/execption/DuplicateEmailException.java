package org.example.localproblemsolver.execption;




public class DuplicateEmailException extends RuntimeException {

    public DuplicateEmailException(String message) {
            super(message);
    }
}

