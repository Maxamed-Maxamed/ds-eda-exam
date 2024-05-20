/* eslint-disable import/extensions, import/no-absolute-path */
import { SQSHandler } from "aws-lambda";


export const handler: SQSHandler = async (event) => {
  console.log("Event ", JSON.stringify(event));
  for (const record of event.Records) {
    const messageBody = JSON.parse(record.body);
    console.log("Raw SNS message ", JSON.stringify(messageBody));
  }
};
