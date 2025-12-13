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
    date: new Date('1995-01-17'),
    masthead: '時空新報',
    edition: '第15,234号 号外',
    weather: '曇り 最高気温8度',
    mainArticle: {
      headline: '阪神大震災 死者5000人超の恐れ',
      subheadline: '神戸市中心部で甚大な被害 救助活動続く',
      content: '17日午前5時46分、淡路島北部を震源とするマグニチュード7.3の直下型地震が発生し、神戸市を中心に甚大な被害をもたらした。気象庁はこの地震を「平成7年兵庫県南部地震」と命名。神戸市内では多くの建物が倒壊し、各地で火災が発生している。高速道路や鉄道も寸断され、交通網は麻痺状態。政府は直ちに非常災害対策本部を設置し、自衛隊の災害派遣を決定した。被災地では懸命の救助活動が続いているが、倒壊した建物の下敷きになった住民の救出が急がれる。ライフラインも広範囲で停止しており、復旧には相当の時間を要する見通し。',
      category: 'main',
      imagePrompt: '1995 Kobe earthquake aftermath, collapsed buildings, rescue workers, damaged highway, documentary photography, serious tone',
    },
    subArticles: [
      {
        headline: '高速道路が横倒し 衝撃の光景',
        content: '阪神高速道路の高架橋が約600メートルにわたって横倒しになり、通行中の車両が取り残された。この衝撃的な光景は、都市型地震の恐ろしさを如実に物語っている。専門家は耐震基準の見直しを訴えている。',
        category: 'society',
        imagePrompt: '1995 Kobe earthquake collapsed highway, Hanshin Expressway fallen, dramatic damage, news photography style',
      },
      {
        headline: '全国から救援物資続々',
        content: '被災地への救援物資が全国から届き始めている。各自治体は毛布、飲料水、食料品などの支援を表明。ボランティアの受け入れ態勢も整いつつあるが、現地へのアクセスが困難な状況が続いている。',
        category: 'society',
        imagePrompt: 'Relief supplies, volunteers organizing aid packages, humanitarian response, 1990s Japan, documentary style',
      },
      {
        headline: '安否確認に電話殺到 回線パンク',
        content: '被災地の安否を確認しようとする電話が殺到し、通信回線がパンク状態に。NTTは災害用伝言ダイヤル「171」の運用を開始したが、依然として繋がりにくい状況が続いている。',
        category: 'news',
        imagePrompt: 'People using public phones, worried expressions, 1995 Japan, communication during disaster, news photography',
      },
    ],
    editorial: {
      headline: '未曾有の災害に立ち向かう',
      content: '戦後最大級の都市直下型地震が、我が国を襲った。高度経済成長期に建設された構造物の脆弱さが露呈し、防災体制の再検討が急務である。今は一人でも多くの命を救うことに全力を注ぐべきときだ。そして、この悲劇を教訓として、真に災害に強い国づくりを進めなければならない。被災された方々に心よりお見舞い申し上げる。',
      category: 'editorial',
    },
    columnTitle: '天声人語',
    columnContent: '早朝の静寂を破る激しい揺れ。一瞬にして日常が崩れ去った。しかし、瓦礫の下から聞こえる声に、救助隊員は不眠不休で応える。人間の絆が試される時である。',
    advertisements: [
      {
        title: '義援金受付',
        content: '日本赤十字社にて義援金を受け付けております。被災地支援にご協力ください。',
        style: 'vintage',
      },
      {
        title: '災害用伝言ダイヤル',
        content: '171 + 被災地の電話番号で安否確認ができます。ご活用ください。',
        style: 'vintage',
      },
      {
        title: '献血のお願い',
        content: '各地の献血センターにて、献血へのご協力をお願いいたします。',
        style: 'vintage',
      },
    ],
    personalMessage: {
      recipientName: '田中 健太',
      senderName: 'ご家族一同',
      message: 'お誕生日おめでとう。大変な日に生まれたけれど、その分強く優しく育ってくれました。',
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
    description: '2024年6月15日 - 架空のお祝いニュース',
    occasion: '結婚記念日',
    style: 'reiwa' as const,
    settings: {
      accuracy: 0,
      humor: 100,
      appearance: 'メイン記事に主役として登場',
    },
  },
  {
    id: 'heisei-1995',
    title: '平成風の新聞',
    description: '1995年1月17日 - 阪神・淡路大震災',
    occasion: '誕生日',
    style: 'heisei' as const,
    settings: {
      accuracy: 100,
      humor: 0,
      appearance: '記事には登場しない',
    },
  },
  {
    id: 'showa-1970',
    title: '昭和風の新聞',
    description: '1970年3月15日 - 大阪万博開幕前',
    occasion: '古希祝い',
    style: 'showa' as const,
    settings: {
      accuracy: 50,
      humor: 50,
      appearance: 'サブ記事に関係者として登場',
    },
  },
];
