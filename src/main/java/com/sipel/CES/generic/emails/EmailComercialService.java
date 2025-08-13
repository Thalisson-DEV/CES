package com.sipel.CES.generic.emails;

import com.sipel.CES.comercial.solicitacoes.entity.SolicitacaoComercial;
import com.sipel.CES.comercial.solicitacoesItems.entity.SolicitacaoComercialItems;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

@Service
public class EmailComercialService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    @Async
    public void sendNewRequestNotificationEmail(SolicitacaoComercial solicitacao, List<SolicitacaoComercialItems> items) {
        try {
            List<String> recipients = new ArrayList<>();
            String emailCoordenador = solicitacao.getEquipe().getEmailCoordenador();
            String emailAlmoxarifado = solicitacao.getEquipe().getEmailAlmoxarifado();

            if (emailCoordenador != null && !emailCoordenador.isBlank()) {
                Stream.of(emailCoordenador.split("[;,]"))
                        .map(String::trim)
                        .filter(email -> email.contains("@"))
                        .forEach(recipients::add);
            }
            if (emailAlmoxarifado != null && !emailAlmoxarifado.isBlank()) {
                Stream.of(emailAlmoxarifado.split("[;,]"))
                        .map(String::trim)
                        .filter(email -> email.contains("@"))
                        .forEach(recipients::add);
            }

            if (recipients.isEmpty()) {
                System.err.println("Nenhum destinatário de e-mail válido encontrado para a equipe: " + solicitacao.getEquipe().getNomeEquipe());
                return;
            }

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

            helper.setFrom(senderEmail);
            helper.setTo(recipients.toArray(new String[0]));
            helper.setSubject("Solicitação de Materiais Criada - #" + solicitacao.getId());

            String htmlBody = buildNewHtmlEmailBody(solicitacao, items);
            helper.setText(htmlBody, true);

            mailSender.send(mimeMessage);

        } catch (Exception e) {
            e.getStackTrace();
        }
    }

    @Async
    public void sendAcceptedRequestNotificationEmail(SolicitacaoComercial solicitacao, List<SolicitacaoComercialItems> items) {
        try {
            List<String> recipients = new ArrayList<>();
            String emailCoordenador = solicitacao.getEquipe().getEmailCoordenador();
            String emailAlmoxarifado = solicitacao.getEquipe().getEmailAlmoxarifado();

            if (emailCoordenador != null && !emailCoordenador.isBlank()) {
                Stream.of(emailCoordenador.split("[;,]"))
                        .map(String::trim)
                        .filter(email -> email.contains("@"))
                        .forEach(recipients::add);
            }
            if (emailAlmoxarifado != null && !emailAlmoxarifado.isBlank()) {
                Stream.of(emailAlmoxarifado.split("[;,]"))
                        .map(String::trim)
                        .filter(email -> email.contains("@"))
                        .forEach(recipients::add);
            }

            if (recipients.isEmpty()) {
                System.err.println("Nenhum destinatário de e-mail válido encontrado para a equipe: " + solicitacao.getEquipe().getNomeEquipe());
                return;
            }

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

            helper.setFrom(senderEmail);
            helper.setTo(recipients.toArray(new String[0]));
            helper.setSubject("Solicitação de Materiais Confirmada - #" + solicitacao.getId());

            String htmlBody = buildAcceptedHtmlEmailBody(solicitacao, items);
            helper.setText(htmlBody, true);

            mailSender.send(mimeMessage);

        } catch (Exception e) {
            e.getStackTrace();
        }
    }

    @Async
    public void sendRejectedRequestNotificationEmail(SolicitacaoComercial solicitacao, List<SolicitacaoComercialItems> items) {
        try {
            List<String> recipients = new ArrayList<>();
            String emailCoordenador = solicitacao.getEquipe().getEmailCoordenador();
            String emailAlmoxarifado = solicitacao.getEquipe().getEmailAlmoxarifado();

            if (emailCoordenador != null && !emailCoordenador.isBlank()) {
                Stream.of(emailCoordenador.split("[;,]"))
                        .map(String::trim)
                        .filter(email -> email.contains("@"))
                        .forEach(recipients::add);
            }
            if (emailAlmoxarifado != null && !emailAlmoxarifado.isBlank()) {
                Stream.of(emailAlmoxarifado.split("[;,]"))
                        .map(String::trim)
                        .filter(email -> email.contains("@"))
                        .forEach(recipients::add);
            }

            if (recipients.isEmpty()) {
                System.err.println("Nenhum destinatário de e-mail válido encontrado para a equipe: " + solicitacao.getEquipe().getNomeEquipe());
                return;
            }

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

            helper.setFrom(senderEmail);
            helper.setTo(recipients.toArray(new String[0]));
            helper.setSubject("Solicitação de Materiais Rejeitada - #" + solicitacao.getId());

            String htmlBody = buildRejectedHtmlEmailBody(solicitacao, items);
            helper.setText(htmlBody, true);

            mailSender.send(mimeMessage);

        } catch (Exception e) {
            e.getStackTrace();
        }
    }


    private String buildNewHtmlEmailBody(SolicitacaoComercial solicitacao, List<SolicitacaoComercialItems> items) {
        StringBuilder itemsTable = new StringBuilder();
        itemsTable.append("<table>")
                .append("<tr><th>Material</th><th>Código</th><th>Quantidade Solicitada</th></tr>");

        for (SolicitacaoComercialItems item : items) {
            itemsTable.append("<tr>")
                    .append("<td>").append(item.getMaterialId().getNomeMaterial()).append("</td>")
                    .append("<td>").append(item.getMaterialId().getCodigoMaterial()).append("</td>")
                    .append("<td>").append(item.getQuantidadeSolicitada()).append("</td>")
                    .append("</tr>");
        }
        itemsTable.append("</table>");

        String template = """
            <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px; color: #333; }
              .container { background-color: #ffffff; padding: 25px; border-radius: 8px; box-shadow: 0px 0px 5px rgba(0,0,0,0.1); max-width: 700px; margin: 0 auto; }
              h2 { color: #e64d00; text-align: center; }
              .banner { text-align: center; margin: 20px 0; }
              .content { font-size: 15px; margin-top: 15px; line-height: 1.6; }
              .highlight { font-weight: bold; color: #e64d00; }
              .signature { margin-top: 40px; font-size: 14px; color: #555; }
              table { margin-top: 15px; width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; font-size: 14px; }
              th { background-color: #f0f0f0; font-weight: bold; text-align: left; }
            </style>
            <div class="container">
              <h2>Nova Solicitação de Materiais Criada</h2>
              <div class="banner">
                <img src="https://i.imgur.com/Y6Uv1JV.jpeg" alt="Banner" style="width: 30%; max-width: 200px;">
              </div>
              <div class="content">
                <p>Bom dia!</p>
                <p>Uma nova solicitação de materiais (<strong>#{ID_SOLICITACAO}</strong>) foi <span class="highlight">CRIADA</span> para equipe <strong>{NOME_EQUIPE}</strong> e está aguardando a sua atenção.</p>
                <p><strong>Orientações:</strong></p>
                <ul>
                  <li>Acesse o sistema para atender ou editar os itens desta solicitação.</li>
                  <li>O solicitante <strong>{NOME_SOLICITANTE}</strong> será notificado sobre as atualizações.</li>
                </ul>
                <p>Abaixo seguem os itens solicitados:</p>
                {TABELA_ITENS}
                <div class="signature">
                  <p>À disposição,</p>
                  <p><strong>CES - Controle de Estoque SIPEL</strong></p>
                </div>
              </div>
            </div>
            """;

        return template
                .replace("{ID_SOLICITACAO}", String.valueOf(solicitacao.getId()))
                .replace("{NOME_EQUIPE}", solicitacao.getEquipe().getNomeEquipe())
                .replace("{NOME_SOLICITANTE}", solicitacao.getSolicitante().getNomeCompleto())
                .replace("{TABELA_ITENS}", itemsTable.toString());
    }

    private String buildAcceptedHtmlEmailBody(SolicitacaoComercial solicitacao, List<SolicitacaoComercialItems> items) {
        StringBuilder itemsTable = new StringBuilder();
        itemsTable.append("<table>")
                .append("<tr><th>Material</th><th>Código</th><th>Quantidade Solicitada</th><th>Quantidade Atendida</th></tr>");

        for (SolicitacaoComercialItems item : items) {
            itemsTable.append("<tr>")
                    .append("<td>").append(item.getMaterialId().getNomeMaterial()).append("</td>")
                    .append("<td>").append(item.getMaterialId().getCodigoMaterial()).append("</td>")
                    .append("<td>").append(item.getQuantidadeSolicitada()).append("</td>")
                    .append("<td>").append(item.getQuantidadeAtendida()).append("</td>")
                    .append("</tr>");
        }
        itemsTable.append("</table>");

        String template = """
                    <style>
                        body {font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px; color: #333;}
                        .container {background-color: #ffffff; padding: 25px; border-radius: 8px; box-shadow: 0px 0px 5px rgba(0,0,0,0.1); max-width: 700px; margin: 0 auto;}
                        h2 {color: #0E2AD3; text-align: center;}
                        .banner {text-align: center; margin: 20px 0;}
                        .content {font-size: 15px; margin-top: 15px; line-height: 1.6;}
                        .confirmation {font-weight: bold; color: #0E2AD3;}
                        .signature {margin-top: 40px; font-size: 14px; color: #555;}
                        table {margin-top: 15px; width: 100%; border-collapse: collapse;}
                        th, td {border: 1px solid #ddd; padding: 8px; font-size: 14px;}
                        th {background-color: #f0f0f0; font-weight: bold; text-align: left;}
                    </style>
            <div class="container">
              <h2>Nova Solicitação de Materiais Confirmada</h2>
              <div class="banner">
                <img src="https://i.imgur.com/Y6Uv1JV.jpeg" alt="Banner" style="width: 30%; max-width: 200px;">
              </div>
              <div class="content">
                <p>Bom dia!</p>
                <p>Sua solicitação de materiais (<strong>#{ID_SOLICITACAO}</strong>) foi <span class="highlight">CONFIRMADA</span> para equipe <strong>{NOME_EQUIPE}</strong>.</p>
                <p><strong>Orientações:</strong></p>
                <ul>
                  <li>Caso ache necessário, confira as informações descritas aqui na aplicação.</li>
                </ul>
                <p>Abaixo seguem os itens confirmados:</p>
                {TABELA_ITENS}
                <div class="signature">
                  <p>À disposição,</p>
                  <p><strong>CES - Controle de Estoque SIPEL</strong></p>
                </div>
              </div>
            </div>
            """;

        return template
                .replace("{ID_SOLICITACAO}", String.valueOf(solicitacao.getId()))
                .replace("{NOME_EQUIPE}", solicitacao.getEquipe().getNomeEquipe())
                .replace("{TABELA_ITENS}", itemsTable.toString());
    }

    private String buildRejectedHtmlEmailBody(SolicitacaoComercial solicitacao, List<SolicitacaoComercialItems> items) {
        StringBuilder itemsTable = new StringBuilder();
        itemsTable.append("<table>")
                .append("<tr><th>Material</th><th>Código</th><th>Quantidade Solicitada</th><th>Quantidade Atendida</th></tr>");

        for (SolicitacaoComercialItems item : items) {
            itemsTable.append("<tr>")
                    .append("<td>").append(item.getMaterialId().getNomeMaterial()).append("</td>")
                    .append("<td>").append(item.getMaterialId().getCodigoMaterial()).append("</td>")
                    .append("<td>").append(item.getQuantidadeSolicitada()).append("</td>")
                    .append("<td>").append(item.getQuantidadeAtendida()).append("</td>")
                    .append("</tr>");
        }
        itemsTable.append("</table>");

        String template = """
                    <style>
                                    body {
                                      font-family: Arial, sans-serif;
                                      background-color: #f4f4f4;
                                      padding: 30px;
                                      color: #333;
                                    }
                                    .container {
                                      background-color: #ffffff;
                                      padding: 25px;
                                      border-radius: 8px;
                                      box-shadow: 0px 0px 5px rgba(0,0,0,0.1);
                                      max-width: 700px;
                                      margin: 0 auto;
                                    }
                                    h2 {
                                      color: #D32F2F;
                                      text-align: center;
                                    }
                                    .banner {
                                      text-align: center;
                                      margin: 20px 0;
                                    }
                                    .content {
                                      font-size: 15px;
                                      margin-top: 15px;
                                      line-height: 1.6;
                                    }
                                    .rejection {
                                      font-weight: bold;
                                      color: #D32F2F;
                                    }
                                    .signature {
                                      margin-top: 40px;
                                      font-size: 14px;
                                      color: #555;
                                    }
                                    table {
                                      margin-top: 15px;
                                      width: 100%;
                                      border-collapse: collapse;
                                    }
                                    th, td {
                                      border: 1px solid #ddd;
                                      padding: 8px;
                                      font-size: 14px;
                                    }
                                    th {
                                      background-color: #f0f0f0;
                                      font-weight: bold;
                                      text-align: left;
                                    }
                                  </style>
            <div class="container">
              <h2>Nova Solicitação de Materiais Rejeitada</h2>
              <div class="banner">
                <img src="https://i.imgur.com/Y6Uv1JV.jpeg" alt="Banner" style="width: 30%; max-width: 200px;">
              </div>
              <div class="content">
                <p>Bom dia!</p>
                <p>Sua solicitação de materiais (<strong>#{ID_SOLICITACAO}</strong>) foi <span class="highlight">REJEITADA</span> para equipe <strong>{NOME_EQUIPE}</strong>.</p>
                <p><strong>Orientações:</strong></p>
                <ul>
                  <li>Caso ache necessário, confira as informações descritas aqui na aplicação.</li>
                  <li>Se for possível, verifique o motivo da rejeição com o almoxarifado.</li>
                </ul>
                <p>Abaixo seguem os itens rejeitados:</p>
                {TABELA_ITENS}
                <div class="signature">
                  <p>À disposição,</p>
                  <p><strong>CES - Controle de Estoque SIPEL</strong></p>
                </div>
              </div>
            </div>
            """;

        return template
                .replace("{ID_SOLICITACAO}", String.valueOf(solicitacao.getId()))
                .replace("{NOME_EQUIPE}", solicitacao.getEquipe().getNomeEquipe())
                .replace("{TABELA_ITENS}", itemsTable.toString());
    }
}