import * as cdk from "aws-cdk-lib";
import * as lambdanode from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import * as events from "aws-cdk-lib/aws-lambda-event-sources";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subs from "aws-cdk-lib/aws-sns-subscriptions";
import * as iam from "aws-cdk-lib/aws-iam";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class EDAAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
	super(scope, id, props);

	const bucket = new s3.Bucket(this, "ABucket", {
  	removalPolicy: cdk.RemovalPolicy.DESTROY,
  	autoDeleteObjects: true,
  	publicReadAccess: false,
	});

	const table = new dynamodb.Table(this, "TableA", {
  	billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  	partitionKey: { name: "name", type: dynamodb.AttributeType.STRING },
  	removalPolicy: cdk.RemovalPolicy.DESTROY,
  	tableName: "ZppData",
	});

	const queueB = new sqs.Queue(this, "QueueB", {
  	receiveMessageWaitTime: cdk.Duration.seconds(10),
	});

	const queueA = new sqs.Queue(this, "QueueA", {
  	receiveMessageWaitTime: cdk.Duration.seconds(5),
	});

	const topic1 = new sns.Topic(this, "TopicA", {
  	displayName: "New Image topic",
	});

	const topic2 = new sns.Topic(this, "TopicB", {
  	displayName: "New Image topic",
	});

	const lambdaAFn = new lambdanode.NodejsFunction(this, "lambdaAFn", {
  	runtime: lambda.Runtime.NODEJS_18_X,
  	entry: `${__dirname}/../lambdas/lambdaA.ts`,
  	timeout: cdk.Duration.seconds(15),
  	memorySize: 128,
	});

	lambdaAFn.addEventSource(new events.SnsEventSource(topic1));

	const lambdaBFn = new lambdanode.NodejsFunction(this, "lambdaBFn", {
  	runtime: lambda.Runtime.NODEJS_18_X,
  	entry: `${__dirname}/../lambdas/lambdaB.ts`,
  	timeout: cdk.Duration.seconds(15),
  	memorySize: 128,
	});

	lambdaBFn.addEventSource(new events.SqsEventSource(queueB));

	new cdk.CfnOutput(this, "Topic 1", {
  	value: topic1.topicArn,
	});
  }
}
