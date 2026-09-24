import Image from 'next/image'

export default function Usage() {
  return (
    <main className="bg-base-200 p-4 sm:p-8 w-full overflow-x-hidden">
      <div className="max-w-4xl mx-auto bg-base-100 p-6 sm:p-10 rounded-2xl shadow-lg">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">使い方</h2>
          <p className="text-base-content">
            「ねこあるき」は、地域で見かけた猫の情報を投稿し、
            <br />
            地図上で可視化する Web アプリケーションです。
          </p>
        </div>

        <section className="mb-12">
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">目次</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { href: '#map', label: 'マップの使い方' },
              { href: '#timeline', label: 'タイムラインの見方' },
              { href: '#post', label: '写真の投稿方法' },
              { href: '#guidelines', label: '注意事項' },
            ].map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="flex items-center justify-between p-3 rounded-lg bg-base-200 hover:bg-primary hover:text-primary-content transition-colors duration-200"
                >
                  <span>{item.label}</span>
                  <span aria-hidden className="opacity-70">
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <div className="divider my-8" />

        <section className="py-6 scroll-mt-20" id="map">
          <h3 className="text-2xl font-semibold mb-6 border-l-4 border-primary pl-4">マップの使い方</h3>

          <div className="space-y-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
              <ol className="list-decimal list-inside space-y-2 mb-4 lg:mb-0">
                <li>マップ上には、投稿された位置情報の場所にピンが表示されています。</li>
                <li>ピンをクリックして、投稿の詳細を確認できます。</li>
              </ol>

              <div className="space-y-4">
                <Image
                  src="/images/usage_map_01.png"
                  alt="マップのピン表示"
                  width={400}
                  height={240}
                  className="rounded-lg shadow-md w-full"
                  priority
                />
                <Image
                  src="/images/usage_map_02.png"
                  alt="ピンをクリックした時の表示"
                  width={400}
                  height={240}
                  className="rounded-lg shadow-md w-full"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="divider my-8" />

        <section className="py-6 scroll-mt-20" id="timeline">
          <h3 className="text-2xl font-semibold mb-6 border-l-4 border-primary pl-4">
            タイムラインの使い方
          </h3>

          <div className="space-y-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center mb-8">
              <div>
                <h4 className="text-xl font-semibold mb-3">投稿カードについて</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li>ハートマークで「かわいい」を伝えられます。</li>
                  <li>コメントアイコンで投稿へのコメントを見たり、書いたりできます。</li>
                  <li>「地図で見る」ボタンで、その投稿の場所をマップで表示します。</li>
                </ul>
              </div>

              <Image
                src="/images/usage_indivisual_post.png"
                alt="投稿カードの操作"
                width={400}
                height={240}
                className="rounded-lg shadow-md w-full"
              />
            </div>

            <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
              <div>
                <h4 className="text-xl font-semibold mb-3">タブの機能</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li>「すべての猫」には、全ユーザーの投稿が表示されます。</li>
                  <li>「自分が投稿した猫」には、自分の投稿だけが表示されます。（要ログイン）</li>
                  <li>「かわいいした猫」には、自分がハートを押した投稿が表示されます。（要ログイン）</li>
                </ul>
              </div>

              <Image
                src="/images/usage_tabbar.png"
                alt="タブバーの機能"
                width={400}
                height={240}
                className="rounded-lg shadow-md w-full"
              />
            </div>
          </div>
        </section>

        <div className="divider my-8" />

        <section className="py-6 scroll-mt-20" id="post">
          <h3 className="text-2xl font-semibold mb-6 border-l-4 border-primary pl-4">写真の投稿方法</h3>

          <ol className="space-y-8">
            <li className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
              <div>
                <span className="font-bold text-lg text-primary mr-2">1.</span>
                メインメニューか、ホーム右下のボタンから投稿ページを開きます。
              </div>
            </li>

            <li className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
              <div>
                <span className="font-bold text-lg text-primary mr-2">2.</span>
                「画像をアップロードする」ボタンで、猫の写真を選択します。
              </div>

              <Image
                src="/images/usage_post_image.png"
                alt="画像のアップロード"
                width={400}
                height={240}
                className="rounded-lg shadow-md w-full mt-2 lg:mt-0"
              />
            </li>

            <li className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
              <div>
                <span className="font-bold text-lg text-primary mr-2">3.</span>
                マップをクリック、または「現在地から設定」で位置情報を設定します。
              </div>

              <Image
                src="/images/usage_post_map.png"
                alt="位置情報の設定"
                width={400}
                height={240}
                className="rounded-lg shadow-md w-full mt-2 lg:mt-0"
              />
            </li>

            <li className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
              <div>
                <span className="font-bold text-lg text-primary mr-2">4.</span>
                コメント欄に写真の説明やエピソードを入力します。
              </div>

              <Image
                src="/images/usage_post_comment.png"
                alt="コメントの入力"
                width={400}
                height={240}
                className="rounded-lg shadow-md w-full mt-2 lg:mt-0"
              />
            </li>

            <li className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
              <div>
                <span className="font-bold text-lg text-primary mr-2">5.</span>
                「投稿する」ボタンをクリックして、みんなに共有します。
              </div>
            </li>
          </ol>
        </section>

        <div className="divider my-8" />

        <section className="scroll-mt-20" id="guidelines">
          <div className="card bg-accent text-accent-content">
            <div className="card-body">
              <h3 className="card-title text-2xl">注意事項</h3>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>飼い猫を撮影する際は、飼い主様の許可を得てください。</li>
                <li>私有地への立ち入りや、住民の迷惑になる行為は避けてください。</li>
                <li>猫が驚かないよう、優しく静かに見守りましょう。</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
