import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
// ec2
import * as ec2 from 'aws-cdk-lib/aws-ec2';
// ファイルを読み込むためのパッケージを import
import { readFileSync } from "fs";
// Amazon RDS用
import * as rds from 'aws-cdk-lib/aws-rds';

export class CdkPlayGroundStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    //vpcを宣言
    const vpc = new ec2.Vpc(this, "BlogVpc", {
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
    });

    // EC2 インスタンスの宣言
    const webServer1 = new ec2.Instance(this, "WordpressServer1", {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.SMALL),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },

    });

    // user-data.sh を読み込み、変数に格納
    const script = readFileSync("./lib/resources/user-data.sh", "utf8");
    // EC2 インスタンスにユーザーデータを追加
    webServer1.addUserData(script);

    // port80, 全ての IP アドレスからのアクセスを許可
    webServer1.connections.allowFromAnyIpv4(ec2.Port.tcp(80));

    // EC2 インスタンスアクセス用の IP アドレスを出力
    new CfnOutput(this, "WordpressServer1PublicIPAddress", {
      value: `http://${webServer1.instancePublicIp}`,
    });

    // RDS DB インスタンスを宣言
    const dbServer = new rds.DatabaseInstance(this, "WordPressDB", {
      engine: rds.DatabaseInstanceEngine.mysql({ version: rds.MysqlEngineVersion.VER_8_0_36 }),
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.SMALL),
      databaseName: "wordpress",
    });

    // webServer1からのアクセスを許可
    dbServer.connections.allowDefaultPortFrom(webServer1);
  }
}
