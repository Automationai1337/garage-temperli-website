<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'method_not_allowed']);
  exit;
}
$raw = file_get_contents('php://input');
$data = json_decode($raw ?: '', true);
if (!is_array($data)) {
  http_response_code(400);
  echo json_encode(['error' => 'invalid_json']);
  exit;
}
$message = trim((string)($data['message'] ?? ''));
if ($message === '' || mb_strlen($message) > 2000) {
  http_response_code(422);
  echo json_encode(['error' => 'invalid_message']);
  exit;
}
$payload = [
  'message' => $message,
  'conversationId' => (string)($data['conversationId'] ?? ''),
  'visitorId' => (string)($data['visitorId'] ?? ''),
  'messageId' => (string)($data['messageId'] ?? ''),
  'history' => is_array($data['history'] ?? null) ? array_slice($data['history'], -20) : []
];
$ch = curl_init('https://botsgenerator.app.n8n.cloud/webhook/werkstatt-chat');
curl_setopt_array($ch, [
  CURLOPT_POST => true,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CONNECTTIMEOUT => 8,
  CURLOPT_TIMEOUT => 30,
  CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'x-widget-key: a34bf29e583d7bce1d9e62ab31fe887026ea1564'],
  CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE)
]);
$body = curl_exec($ch);
$status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);
if ($body === false || $status < 200 || $status >= 300) {
  http_response_code(502);
  echo json_encode(['error' => 'assistant_unavailable']);
  exit;
}
http_response_code(200);
echo $body;
