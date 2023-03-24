import SibApiV3Sdk from "sib-api-v3-sdk";
export const sendEmail = () => {
  let defaultClient = SibApiV3Sdk.ApiClient.instance;

  let apiKey = defaultClient.authentications["api-key"];
  apiKey.apiKey =
    "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";

  let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.subject = "My First Email";

  sendSmtpEmail.sender = {
    name: "Jubayer Juhan",
    email: "jubayerjuhan.info@gmail.com",
  };
  sendSmtpEmail.to = [
    { email: "davidjuhan23@gmail.com", name: "Abir Hossain" },
  ];
  sendSmtpEmail.replyTo = {
    email: "jubayerjuhan.info@gmail.com",
    name: "Jubayer Juhan",
  };
  sendSmtpEmail.params = {
    parameter: "My param value",
    subject: "New Subject",
  };

  sendSmtpEmail.attachment = [
    {
      url: "https://storage.googleapis.com/my_instructor/Earning_Invoice1679323340755.pdf",
      name: "Invoice.pdf",
    },
  ];
  sendSmtpEmail.templateId = 1;
  apiInstance.sendTransacEmail(sendSmtpEmail).then(
    function (data) {
      console.log(
        "API called successfully. Returned data: " + JSON.stringify(data)
      );
    },
    function (error) {
      console.error(error);
    }
  );
};
