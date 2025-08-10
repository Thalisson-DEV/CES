ALTER TABLE solicitacoes_operacionais
    ALTER COLUMN numero_reserva TYPE INTEGER
        USING numero_reserva::integer;