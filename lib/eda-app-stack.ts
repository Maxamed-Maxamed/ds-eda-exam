import * as cdk from "aws-cdk-lib";
import * as lambdanode from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subs from "aws-cdk-lib/aws-sns-subscriptions";
import * as events from "aws-cdk-lib/aws-lambda-event-sources";

import { Construct } from "constructs";

export class EDAAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const queueA = new sqs.Queue(this, "QueueA", {
      receiveMessageWaitTime: cdk.Duration.seconds(5),
    });

    const queueB = new sqs.Queue(this, "QueueB", {
      receiveMessageWaitTime: cdk.Duration.seconds(10),
    });

    const topic1 = new sns.Topic(this, "TopicA", {
      displayName: "New Image topic",
    });

    const topic2 = new sns.Topic(this, "TopicB", {
      displayName: "New Image topic",
    });

    // Add subscription with filter policy to Topic1
    topic1.addSubscription(new subs.SqsSubscription(queueA, {
      filterPolicy: {
        country: sns.SubscriptionFilter.stringFilter({
          allowlist: ["Ireland", "Spain"],
        }),
      },
    }));

    const lambdaAFn = new lambdanode.NodejsFunction(this, "lambdaAFn", {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: `${__dirname}/../lambdas/lambdaA.ts`,
      timeout: cdk.Duration.seconds(15),
      memorySize: 128,
    });

    lambdaAFn.addEventSource(new events.SqsEventSource(queueA));

    const lambdaBFn = new lambdanode.NodejsFunction(this, "lambdaBFn", {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: `${__dirname}/../lambdas/lambdaB.ts`,
      timeout: cdk.Duration.seconds(15),
      memorySize: 128,
    });

    lambdaBFn.addEventSource(new events.SqsEventSource(queueB));
  }
}