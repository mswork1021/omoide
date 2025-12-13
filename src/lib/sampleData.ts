/**
 * サンプル新聞データ
 * 令和 → 平成 → 昭和 の順番で表示
 * 各サンプルで異なるカスタマイズ設定を示す
 */

import type { NewspaperData } from '@/types';

export const sampleNewspapers: NewspaperData[] = [
  // サンプル1: 令和風
  // 設定: 忠実度0% × ユーモア100% × 記念日 × メイン記事に主役として登場
  {
    date: new Date('2024-06-15'),
    masthead: '時空新報',
    edition: '第50,123号 特別号',
    weather: '晴れ 最高気温28度',
    mainArticle: {
      headline: '佐藤花子さん 世界初「全人類から好かれる人」に認定',
      subheadline: '国連が満場一致で決議 地球規模のお祝いムード',
      content: '国際連合は15日、佐藤花子さん（32）を世界初の「全人類から好かれる人」として公式認定した。193カ国の代表が満場一致で賛成し、歴史的な決議となった。佐藤さんは「え、そんな大げさな...」と困惑気味だが、すでに各国首脳からお祝いのメッセージが殺到。アメリカ大統領は「彼女のインスタのフォロワーになれて光栄」、フランス大統領は「パリのエッフェル塔を花子カラーにライトアップする」と発表。日本政府は記念切手の発行を決定し、郵便局には早くも行列ができている。佐藤さんの飼い猫「もちまる」も準認定される見込み。',
      category: 'main',
      imagePrompt: 'Celebration ceremony, confetti, happy crowd cheering, international flags, joyful atmosphere, bright and colorful, photojournalism style',
    },
    subArticles: [
      {
        headline: '「優しすぎて逆に心配」専門家分析',
        content: '心理学者の山田教授は「佐藤さんの優しさレベルは人類史上最高値。道で会った野良猫にも敬語を使うらしい」と分析。周囲からは「たまには怒ってもいいのに」との声も。',
        category: 'society',
        imagePrompt: 'Kind person helping others, warm atmosphere, community scene, soft lighting, documentary style',
      },
      {
        headline: '記念グッズ、発売3秒で完売',
        content: '佐藤さん認定記念のマグカップが発売されたが、オンラインショップでは3秒で完売。転売サイトでは100倍の価格で取引されている。佐藤さん本人は「私のグッズって需要あるの？」と驚きを隠せない様子。',
        category: 'economy',
        imagePrompt: 'Merchandise shop, crowded store, people excited shopping, celebratory atmosphere, retail photography',
      },
      {
        headline: '花子フィーバー 世界各地で',
        content: 'ニューヨークのタイムズスクエア、ロンドンのピカデリーサーカス、東京の渋谷スクランブル交差点で同時に「花子」コールが発生。地球規模の同時多発的お祝いは史上初。',
        category: 'entertainment',
        imagePrompt: 'Global celebration, city lights, Times Square style big screens, crowd celebration, night city photography',
      },
    ],
    editorial: {
      headline: '愛される才能',
      content: '「全人類から好かれる」という偉業を成し遂げた佐藤花子さん。その秘訣を尋ねると「特に何もしてないんですけど...」との答え。この謙虚さこそが、彼女が愛される理由なのかもしれない。我々も見習いたいものである。なお、編集部員も全員ファンである。',
      category: 'editorial',
    },
    columnTitle: '天声人語',
    columnContent: '「好かれる」とは何だろう。佐藤さんは言う。「みんなを好きでいること、かな」。シンプルだが深い。今日も彼女は誰かに「ありがとう」と言っているのだろう。',
    advertisements: [
      {
        title: '花子さん認定記念',
        content: '祝・世界認定！記念セール開催中。全品15%OFF。',
        style: 'modern-retro',
      },
      {
        title: '優しさ検定',
        content: 'あなたの優しさレベルは？オンライン診断スタート。',
        style: 'modern-retro',
      },
      {
        title: '猫カフェもちまる',
        content: '準認定記念！ドリンク無料キャンペーン実施中。',
        style: 'modern-retro',
      },
    ],
    personalMessage: {
      recipientName: '佐藤 花子',
      senderName: 'ご家族一同',
      message: '結婚10周年おめでとう！これからも世界一愛される人でいてね。',
      occasion: '結婚記念日',
    },
  },

  // サンプル2: 平成風
  // 設定: 忠実度100% × ユーモア0% × 誕生日 × 記事には登場しない
  {
    date: new Date('1998-02-07'),
    masthead: '時空新報',
    edition: '第18,456号 特別号',
    weather: '晴れ 最高気温2度',
    mainArticle: {
      headline: '長野五輪 華やかに開幕',
      subheadline: '聖火が信州の夜空を照らす 史上最多の72カ国参加',
      content: '第18回オリンピック冬季競技大会が7日夜、長野市のオリンピックスタジアムで開幕した。開会式には天皇皇后両陛下をはじめ、世界各国から約5万人が参加。聖火リレーの最終ランナーを務めた伊藤みどりさんが聖火台に点火すると、会場は歓声に包まれた。今大会には史上最多となる72カ国・地域から約2300人の選手が参加。日本選手団は166人で、スキージャンプの原田雅彦選手、スピードスケートの清水宏保選手らにメダルの期待がかかる。「自然との共生」をテーマに掲げた今大会は、環境に配慮した運営が特徴となっている。',
      category: 'main',
      imagePrompt: '1998 Nagano Olympics opening ceremony, Olympic stadium at night, fireworks, torch lighting, celebration, news photography style',
    },
    subArticles: [
      {
        headline: 'スキージャンプ 日本勢に期待',
        content: '団体戦で金メダルを狙う日本ジャンプ陣。原田雅彦、船木和喜、岡部孝信、斎藤浩哉の4選手が出場予定。リレハンメルの雪辱を果たせるか、日本中が注目している。',
        category: 'sports',
        imagePrompt: '1998 ski jumping, Japanese athlete, winter sports, Olympic venue, sports photography',
      },
      {
        headline: '長野の街 お祭りムード',
        content: '長野市内は五輪一色。善光寺周辺には各国の観光客が詰めかけ、地元商店街も多言語対応に奮闘している。「おもてなしの心で世界をお迎えしたい」と住民たちは意気込む。',
        category: 'society',
        imagePrompt: '1998 Nagano city streets, Olympic decorations, international tourists, festive atmosphere, documentary photography',
      },
      {
        headline: 'メダル候補続々 日本選手団',
        content: 'スピードスケート500mの清水宏保選手、モーグルの里谷多英選手らがメダル有力候補。フィギュアスケートでは15歳の新星・荒川静香選手にも注目が集まっている。',
        category: 'sports',
        imagePrompt: '1998 Japanese Olympic athletes, speed skating, figure skating, winter sports portraits, sports magazine style',
      },
    ],
    editorial: {
      headline: '平和の祭典、信州の地で',
      content: '戦後初めて、日本で冬季オリンピックが開催される。1972年の札幌大会から26年。アジアで2度目となるこの大会は、日本のウィンタースポーツ発展の証である。「自然との共生」を掲げる今大会が、環境問題への意識を高めるきっかけとなることを期待したい。選手たちの熱い戦いが、世界に感動を届けることを願う。',
      category: 'editorial',
    },
    columnTitle: '天声人語',
    columnContent: '白銀の世界に五輪の輪が輝く。信州の山々に抱かれたこの地で、世界のアスリートたちが夢を追う。冬の寒さも、彼らの情熱の前には霞んで見える。',
    advertisements: [
      {
        title: '長野五輪記念',
        content: '公式グッズ好評発売中。思い出の品をお手元に。',
        style: 'vintage',
      },
      {
        title: 'JR東日本',
        content: '長野新幹線で行こう！東京から最速79分。五輪観戦に便利です。',
        style: 'vintage',
      },
      {
        title: 'コカ・コーラ',
        content: '五輪公式スポンサー。がんばれニッポン！',
        style: 'vintage',
      },
    ],
    personalMessage: {
      recipientName: '田中 健太',
      senderName: 'ご家族一同',
      message: 'お誕生日おめでとう。この日、日本中がオリンピックに沸いていたんだね。',
      occasion: '誕生日',
    },
  },

  // サンプル3: 昭和風
  // 設定: 忠実度50% × ユーモア50% × サブ記事に関係者として登場
  {
    date: new Date('1970-03-15'),
    masthead: '時空新報',
    edition: '第5,678号 朝刊',
    weather: '晴れ 最高気温16度',
    mainArticle: {
      headline: '大阪万博 開幕まであと半月',
      subheadline: '人類の進歩と調和を世界に発信 準備は最終段階',
      content: '日本万国博覧会（大阪万博）の開幕が3月15日に迫り、会場の千里丘陵では準備作業が最終段階を迎えている。「人類の進歩と調和」をテーマに掲げる今回の万博には、77カ国が参加を表明。岡本太郎氏がデザインした「太陽の塔」は高さ70メートルの威容を誇り、すでに万博のシンボルとして注目を集めている。開幕後は6,400万人の来場者を見込んでおり、日本の高度経済成長を世界にアピールする絶好の機会となる。各パビリオンでは最新技術の展示が予定されており、未来の生活を垣間見ることができる。',
      category: 'main',
      imagePrompt: '1970 Osaka Expo, Tower of the Sun, construction site, workers, vintage Japanese newspaper photography, black and white',
    },
    subArticles: [
      {
        headline: '「月の石」展示に長蛇の列か',
        content: 'アメリカ館で展示予定の「月の石」に注目が集まっている。アポロ11号が持ち帰った本物の月の石を見ようと、連日長蛇の列ができる見込み。地元住民の山本一郎さん（45）は「孫と一緒に見に行きたい。宇宙の神秘を感じられそうだ」と期待を語る。',
        category: 'society',
        imagePrompt: 'Apollo moon rock display, museum exhibit, 1970s crowd waiting in line, vintage photography',
      },
      {
        headline: '万博記念 新メニュー続々登場',
        content: '万博開催を記念し、大阪市内の飲食店では新メニューが続々と登場している。「太陽の塔カレー」「進歩と調和パフェ」など、ユニークな名前の料理が話題に。商店街も万博ムード一色で、記念グッズの販売も好調だ。',
        category: 'economy',
        imagePrompt: '1970 Osaka restaurant, Expo themed food display, retro Japanese cafe, vintage color photography',
      },
      {
        headline: '交通整理に警察官3000人動員',
        content: '万博期間中の交通渋滞対策として、大阪府警は延べ3000人の警察官を動員する方針を発表。会場周辺の駐車場は計2万台分を確保したが、公共交通機関の利用を呼びかけている。',
        category: 'news',
        imagePrompt: '1970 Japanese traffic police, directing traffic, Osaka streets, vintage news photography',
      },
    ],
    editorial: {
      headline: '万博が拓く未来',
      content: '戦後25年、焼け野原から立ち上がった日本が、世界に誇る万博を開催する。これは単なる博覧会ではない。我が国の復興と発展を世界に示す、歴史的な節目である。「人類の進歩と調和」というテーマは、高度成長のひずみが見え始めた今こそ、深く噛みしめるべき言葉だ。技術の進歩と人間らしさの調和。この万博を機に、真の豊かさとは何かを考えたい。',
      category: 'editorial',
    },
    columnTitle: '天声人語',
    columnContent: '「こんにちは」と笑顔で迎える万博。外国人客との交流に胸を躍らせる若者たち。言葉が通じなくても、笑顔は万国共通。国際化の波が、この大阪から始まる。',
    advertisements: [
      {
        title: '万博記念乗車券',
        content: '国鉄・私鉄共通フリーパス発売中。会場へは電車が便利です。',
        style: 'vintage',
      },
      {
        title: 'ナショナル',
        content: '未来の暮らしをナショナルから。万博パビリオンにてお待ちしております。',
        style: 'vintage',
      },
      {
        title: '三ツ矢サイダー',
        content: '万博のお供に爽やかな一杯。会場内売店にて販売中。',
        style: 'vintage',
      },
    ],
    personalMessage: {
      recipientName: '山本 一郎',
      senderName: 'ご家族一同',
      message: '古希おめでとうございます！万博の思い出話、また聞かせてください。',
      occasion: '古希祝い',
    },
  },
];

// サンプル表示用のメタ情報（令和→平成→昭和の順）
// カスタマイズ設定を明示
export const sampleMeta = [
  {
    id: 'reiwa-2024',
    title: '令和風の新聞',
    description: '2024年6月15日',
    occasion: '結婚記念日',
    style: 'reiwa' as const,
    // わかりやすい説明
    settingsLabel: {
      content: '完全フィクション！面白さ全開',
      appearance: '佐藤花子さんがトップ記事の主役に',
    },
  },
  {
    id: 'heisei-1998',
    title: '平成風の新聞',
    description: '1998年2月7日 - 長野オリンピック開幕',
    occasion: '誕生日',
    style: 'heisei' as const,
    settingsLabel: {
      content: 'その日の本当のニュースをそのまま',
      appearance: '田中健太さんは記事には登場しない',
    },
  },
  {
    id: 'showa-1970',
    title: '昭和風の新聞',
    description: '1970年3月15日 - 大阪万博',
    occasion: '古希祝い',
    style: 'showa' as const,
    settingsLabel: {
      content: '本当のニュース＋ちょっとユーモア',
      appearance: '山本一郎さんがサブ記事にコメントで登場',
    },
  },
];
