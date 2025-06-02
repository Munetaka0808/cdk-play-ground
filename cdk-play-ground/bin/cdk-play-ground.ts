#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkPlayGroundStack } from '../lib/cdk-play-ground-stack';

const app = new cdk.App();
new CdkPlayGroundStack(app, 'CdkPlayGroundStack');
