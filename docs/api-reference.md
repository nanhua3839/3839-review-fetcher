# 3839.com API Reference

## Endpoint

```
POST https://www.3839.com/app/hykb_web/api/api_user.php
```

## Request

### Headers

```
Content-Type: application/x-www-form-urlencoded
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
Origin: https://www.3839.com
Referer: https://www.3839.com/zone/user/{UID}
```

### Body Parameters

| Parameter  | Type   | Description                                     |
|------------|--------|-------------------------------------------------|
| `ac`       | string | Action name, always `dynamic_home`              |
| `last_id`  | string | Pagination cursor (ID). Empty string for first page. Use `last_id` from previous response. |
| `cursor`   | int    | Pagination cursor (timestamp). `0` for first page. Use `cursor` from previous response. |
| `vuid`     | string | The user's UID (e.g. `20594033`)                |

### Example Request

```
POST /app/hykb_web/api/api_user.php HTTP/1.1
Host: www.3839.com
Content-Type: application/x-www-form-urlencoded
Origin: https://www.3839.com
Referer: https://www.3839.com/zone/user/20594033

ac=dynamic_home&last_id=251571615_cg&cursor=1778483419&vuid=20594033
```

## Response

### Top-Level Structure

```json
{
  "code": "100",
  "result": {
    "last_id": "251548169_cg",
    "cursor": 1776974935,
    "data": [ /* array of review items */ ],
    "num": {
      "num_total": "391",
      "num_comment": "379",
      "num_topic": "1",
      "num_reply": "11",
      "num_video": "0"
    }
  }
}
```

| Field      | Type   | Description                                              |
|------------|--------|----------------------------------------------------------|
| `code`     | string | `"100"` = success, other = error                        |
| `result`   | object | Response payload                                         |
| `result.last_id` | string | Next page's `last_id`. `"-1"` = no more data.     |
| `result.cursor`  | int    | Next page's `cursor`. `-1` = no more data.        |
| `result.data`    | array  | Array of review item objects (up to 20 per request) |
| `result.num`     | object | User statistics (first page only)                     |

### User Statistics (`result.num`)

| Field         | Description              |
|---------------|--------------------------|
| `num_total`   | Total dynamic entries    |
| `num_comment` | Total reviews            |
| `num_topic`   | Total topics/threads     |
| `num_reply`   | Total replies            |
| `num_video`   | Total video entries      |

### Review Item Fields (`result.data[]`)

| Field           | Type   | Description                                                        |
|-----------------|--------|--------------------------------------------------------------------|
| `dynamic_type`  | string | `comment_game` = review, `comment_game_reply` = reply             |
| `pid`           | int    | Platform ID (always `1`)                                           |
| `id`            | string | Review/comment ID (used as `cid` in URL)                          |
| `fid`           | string | Game ID (used as `fid` in URL)                                    |
| `content`       | string | Review text (may contain HTML: `<br />`, etc.)                    |
| `star`          | string | Star rating: `"1"`-`"5"` (empty for replies)                     |
| `addtime`       | string | Unix timestamp of creation                                        |
| `edittime`      | string | Unix timestamp of last edit                                       |
| `time_str`      | string | Human-readable time string                                        |
| `play_time_str` | string | Play time description (e.g. `"3分钟"`, empty if not recorded)    |
| `review_desc`   | string | Review description                                                |
| `game_info`     | object | Game information object                                           |
| `game_info.name`| string | Game name                                                          |
| `user`          | object | User information object                                           |
| `good`          | int    | Number of "good" (upvote) marks                                   |
| `is_good`       | int    | Whether current user upvoted (0/1)                                |
| `posts`         | int    | Number of posts/replies on this review                            |
| `state`         | int    | Review state                                                       |
| `is_top`        | int    | Whether this is pinned (0/1)                                      |

### Review URL Format

```
https://m.3839.com/review/?pid={pid}&fid={fid}&cid={cid}
```

Example:
```
https://m.3839.com/review/?pid=1&fid=200214&cid=251680771
```

## Pagination

1. First request: `last_id=""`, `cursor=0`
2. Subsequent requests: use `last_id` and `cursor` from the previous response
3. End conditions:
   - `last_id == "-1"` → no more data
   - `cursor == -1` → no more data
   - `data` array is empty → no more data

Each request returns up to 20 items. To fetch 300 reviews, approximately 15 requests are needed.

## Error Handling

| Code  | Meaning                    |
|-------|----------------------------|
| `100` | Success                    |
| Other | Error (check `msg` field)  |

If the API returns errors consistently:
1. Verify the UID is valid by visiting `https://www.3839.com/zone/user/{UID}`
2. Check if the API endpoint or parameters have changed by inspecting network requests on the page
3. Increase the delay between requests if rate-limited

## Discovering the API (for troubleshooting)

If the API changes, you can rediscover it:

1. Open `https://www.3839.com/zone/user/{UID}` in a browser
2. Open DevTools → Network tab
3. Filter by `XHR` or `Fetch`
4. Scroll down on the page to trigger loading more reviews
5. Look for a POST request to `api_user.php`
6. Inspect the request body and response to verify the format
