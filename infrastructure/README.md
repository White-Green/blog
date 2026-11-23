# 管理画面の Cloudflare Access

`blog.white-green.net/admin` とその配下を Cloudflare Access で保護します。
Allow ポリシーは管理者1名のメールアドレスを照合し、セッションの有効期間は24時間です。

## HCP Terraform の設定

godoshi と同じ組織 `White-Green` に blog 用 workspace を作成し、次のように設定します。

| 項目 | 設定 |
| --- | --- |
| Workflow | VCS-driven |
| Repository | `White-Green/blog` |
| Branch | `main` |
| Terraform Working Directory | `infrastructure` |
| 実行対象 | `infrastructure/` 内の変更 |
| PR の speculative plan | 有効 |
| Apply Method | godoshi の workspace と同じ設定 |

Cloudflare provider のバージョン制約と lock file は godoshi に合わせています。
state は HCP Terraform の workspace で管理します。

workspace の Variables で、以下を **Terraform variables** として登録します。

| 変数名 | 値 | Sensitive |
| --- | --- | --- |
| `cloudflare_api_token` | 対象アカウントの `Access: Apps and Policies Write` 権限を持つ API トークン | 有効 |
| `cloudflare_account_id` | 対象の Cloudflare アカウント ID | 任意 |
| `admin_email` | 管理者のメールアドレス | 有効 |

Cloudflare Zero Trust では、チームドメインと、管理者が利用できるログイン方法を設定しておきます。
この Application はアカウントに設定されたログイン方法を使用します。

同じパスの Access Application が既にある場合は、初回 apply 前に既存設定を確認し、
Application とポリシーを対応する Terraform resource に import して plan の差分を確認してください。

## Worker の設定

初回 apply 後、Cloudflare コンソールで本番 Worker `white-green-blog` の
Variables and Secrets に以下のテキスト変数を設定し、反映します。

| 変数名 | 値 |
| --- | --- |
| `ADMIN_EMAIL` | HCP Terraform の `admin_email` と同じメールアドレス |
| `CLOUDFLARE_ACCESS_TEAM_DOMAIN` | `https://<team>.cloudflareaccess.com` 形式のチーム URL |
| `CLOUDFLARE_ACCESS_AUD` | HCP Terraform の output `cloudflare_access_aud` の値 |

`fblog_system` はこれらの変数を使って JWT と管理者メールを検証します。
本番の Wrangler 設定にある `keep_vars = true` により、コンソールで設定した変数は再デプロイ後も保持されます。
管理者メールを変更するときは HCP Terraform と Worker の両方を更新します。
Access Application を再作成したときは、新しい output を Worker の `CLOUDFLARE_ACCESS_AUD` に反映します。

## 確認

Terraform 定義のローカル検証はリポジトリのルートから実行できます。

```sh
terraform -chdir=infrastructure fmt -check
terraform -chdir=infrastructure init -backend=false -lockfile=readonly
terraform -chdir=infrastructure validate
```

反映後は次を確認します。

- 未ログインで `/admin` と `/admin/` を開くと Access のログイン画面に進む。
- 許可したメールアドレスで管理画面を表示でき、別のメールアドレスは拒否される。
- 公開記事、RSS、`/.well-known/webfinger` を認証なしで利用できる。
- 記事を再デプロイした後も、管理画面にログインできる。

## 参照

- [godoshi の Terraform 定義](https://github.com/White-Green/godoshi/tree/main/infrastructure)
- [fblog_system の管理画面認証](https://github.com/White-Green/fblog_system/pull/215)
- [fblog_system の本番 Wrangler 設定](https://github.com/White-Green/fblog_system/blob/main/crates/cloudflare_workers/wrangler.template.toml)
- [Cloudflare Access のパス指定](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/app-paths/)
- [HCP Terraform の VCS 設定](https://developer.hashicorp.com/terraform/cloud-docs/workspaces/settings/vcs)
