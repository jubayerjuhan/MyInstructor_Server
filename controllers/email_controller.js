import SibApiV3Sdk from "sib-api-v3-sdk";

var defaultClient = SibApiV3Sdk.ApiClient.instance;

// Configure API key authorization: api-key
var apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey =
  "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";

var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email

export const sendEmail = async (templateid, email, name, sms) => {
  sendSmtpEmail = {
    to: [
      {
        email,
        name,
      },
    ],
    templateId: templateid,
    params: {
      SMS: sms,
      FIRSTNAME: name,
    },
    headers: {
      "X-Mailin-custom":
        "custom_header_1:custom_value_1|custom_header_2:custom_value_2",
    },
  };
  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    console.log(error);
  }
};
