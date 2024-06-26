locals {
  name = "${var.env_prefix}_${var.function_name}"
}

resource "aws_iam_role" "iam_for_lambda" {
  name = "${var.env_prefix}_iam_for_lambda-${var.function_name}"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_policy" "lambda_q_iam_policy" {
  count       = var.q_arn != "" ? 1 : 0
  name        = "${var.env_prefix}_lambda_access-policy-${local.name}"
  description = "IAM Policy"
  policy      = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
        "Effect": "Allow",
        "Action": [
            "sqs:*"
        ],
        "Resource": "${var.q_arn}"
    }
  ]
}
  EOF
}

resource "aws_iam_role_policy_attachment" "default-iam-policy-attach" {
  role       = aws_iam_role.iam_for_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

resource "aws_iam_role_policy_attachment" "queue-iam-policy-attach" {
  count      = var.q_arn != "" ? 1 : 0
  role       = aws_iam_role.iam_for_lambda.name
  policy_arn = aws_iam_policy.lambda_q_iam_policy[0].arn
}

resource "aws_iam_role_policy_attachment" "additional-iam-policies-attach" {
  for_each = { for v in var.policies_arn : v => v }
  # count = length(var.policies_arn)
  role       = aws_iam_role.iam_for_lambda.name
  policy_arn = each.value
  # policy_arn = var.policies_arn[count.index]
}

data "archive_file" "archived_function" {
  type        = "zip"
  source_dir  = var.source_dir
  output_path = var.output_path
}

resource "aws_lambda_function" "function" {
  filename         = var.output_path
  function_name    = local.name
  source_code_hash = data.archive_file.archived_function.output_base64sha256
  role             = aws_iam_role.iam_for_lambda.arn
  handler          = "index.handler"
  runtime          = "nodejs16.x"
  layers           = var.layers
  timeout          = var.timeout
  environment {
    variables = var.env
  }
  # vpc_config {
  #   subnet_ids         = var.subnet_ids
  #   security_group_ids = var.security_group_ids
  # }
}

resource "aws_lambda_permission" "lambda_invoke_permission" {
  count         = var.invoke_src_arn != "" ? 1 : 0
  action        = "lambda:InvokeFunction"
  function_name = local.name
  principal     = var.invoke_principle

  # The /*/*/* part allows invocation from any stage, method and resource path
  # within API Gateway REST API.
  source_arn = var.invoke_src_arn
}

resource "aws_iam_policy" "lambda_invoke_policy" {
  name        = "${var.env_prefix}_lambda_invoke_policy_${local.name}"
  description = "IAM Lambda Invoke Policy"
  policy      = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
        "Effect": "Allow",
        "Action": [
            "lambda:InvokeFunction"
        ],
        "Resource": "${aws_lambda_function.function.arn}"
    }
  ]
}
  EOF
}

resource "aws_lambda_event_source_mapping" "event_source_mapping" {
  count            = var.q_arn != "" ? 1 : 0
  event_source_arn = var.q_arn
  enabled          = true
  function_name    = aws_lambda_function.function.arn
  batch_size       = 1
}

resource "aws_cloudwatch_event_rule" "keep_warm_rule" {
  count               = var.keep_warm ? 1 : 0
  name                = "every-1-minute"
  description         = "Fires every 1 minute"
  schedule_expression = "rate(1 minute)"
}

resource "aws_cloudwatch_event_target" "keep_warm_target" {
  count     = var.keep_warm ? 1 : 0
  rule      = aws_cloudwatch_event_rule.keep_warm_rule[0].name
  target_id = local.name
  arn       = aws_lambda_function.function.arn
}

resource "aws_lambda_permission" "keep_warm_permission" {
  count         = var.keep_warm ? 1 : 0
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.function.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.keep_warm_rule[0].arn
}
