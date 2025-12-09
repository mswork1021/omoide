/**
 * サンプル新聞データ
 * 令和 → 平成 → 昭和 の順番で表示
 * 本番生成と完全に同じレイアウトで表示
 */

import type { NewspaperData } from '@/types';

export const sampleNewspapers: NewspaperData[] = [
  // サンプル1: 令和風 - 2020年7月24日（東京オリンピック予定日）
  {
    date: new Date('2020-07-24'),
    masthead: '時空新報',
    edition: '第45,678号 朝刊',
    weather: '晴れ 最高気温32度',
    mainArticle: {
      headline: '東京五輪 異例の1年延期後も開催困難か',
      subheadline: '新型コロナ感染拡大で世界的な懸念広がる',
      content: '新型コロナウイルスの世界的な感染拡大を受け、2020年夏に予定されていた東京オリンピック・パラリンピックの開催が危ぶまれている。国際オリンピック委員会（IOC）と日本政府は、史上初となる1年の延期を決定したものの、収束の見通しが立たない中、開催可否をめぐる議論は続いている。選手たちは練習環境の制限に苦しみながらも、大会実現に向けて準備を続けている。世界中のアスリートが集う平和の祭典が、このパンデミックという未曽有の危機を乗り越えて開催されるか、世界が注目している。医療従事者への感謝と、一日も早い収束を願う声が日本中から上がっている。',
      category: 'main',
      imagePrompt: 'Tokyo 2020 Olympics empty stadium, modern sports facility, Japan, pandemic era, photojournalism style',
    },
    subArticles: [
      {
        headline: 'リモートワーク急速に普及',
        content: '新型コロナウイルスの感染拡大に伴い、在宅勤務・リモートワークが急速に普及している。IT企業を中心に、オフィスに出社せずに働くスタイルが定着しつつある。Zoom、Teams等のビデオ会議ツールの利用者は前年比10倍以上に増加。「働き方改革」が一気に進んだ形となった。',
        category: 'economy',
        imagePrompt: 'Japanese person working from home, laptop, video conference, modern minimalist room, 2020s lifestyle photography',
      },
      {
        headline: '「鬼滅の刃」興行収入が歴代記録更新',
        content: '劇場版「鬼滅の刃 無限列車編」が公開から73日で興行収入324億円を突破し、「千と千尋の神隠し」の記録を19年ぶりに塗り替えた。コロナ禍での映画館営業制限にも関わらず、社会現象的なヒットとなった。',
        category: 'entertainment',
        imagePrompt: 'Japanese anime movie theater premiere, crowds with masks, movie poster, entertainment news photography style',
      },
      {
        headline: '菅内閣発足 デジタル庁創設へ',
        content: '安倍晋三首相の辞任を受け、菅義偉氏が第99代内閣総理大臣に就任した。新内閣は行政のデジタル化を最優先課題に掲げ、2021年のデジタル庁創設を目指す方針を表明。「縦割り打破」をスローガンに改革を進める。',
        category: 'news',
        imagePrompt: 'Japanese prime minister press conference, government building, official ceremony, news photography style',
      },
    ],
    editorial: {
      headline: 'コロナ後の社会を見据えて',
      content: 'パンデミックは社会のあり方を根底から問い直す機会となった。リモートワークの普及は、都市一極集中の是正や地方創生の可能性を示している。また、医療・介護従事者の献身に改めて感謝するとともに、エッセンシャルワーカーの処遇改善が急務である。この危機を乗り越えた先に、より強靭で持続可能な社会を築くことが、私たちの責務である。困難な時こそ、人と人との繋がりの大切さを忘れずにいたい。',
      category: 'editorial',
    },
    columnTitle: '天声人語',
    columnContent: 'マスクが日常の一部となった。顔の半分を覆うその布越しに、私たちは言葉を交わし、目で微笑む。不自由さの中にも、人間の適応力と創意工夫を見る。この経験は、きっと未来への教訓となるだろう。',
    advertisements: [
      {
        title: 'オンライン診療',
        content: '自宅から医師に相談。初診からOK。専用アプリでかんたん予約。',
        style: 'modern',
      },
      {
        title: 'Uber Eats',
        content: 'お家時間を美味しく。人気レストランの味をお届け。初回配送無料。',
        style: 'modern',
      },
      {
        title: 'Netflix',
        content: 'おうち時間に映画三昧。初月無料キャンペーン実施中。',
        style: 'modern',
      },
    ],
    personalMessage: {
      recipientName: '田中 美咲',
      senderName: 'ご家族一同',
      message: 'お誕生日おめでとうございます。困難な時代でしたが、あなたの笑顔がいつも家族の支えでした。',
      occasion: '誕生日',
    },
  },

  // サンプル2: 平成風 - 1990年4月1日（平成2年）
  {
    date: new Date('1990-04-01'),
    masthead: '時空新報',
    edition: '第12,847号 朝刊',
    weather: '晴れ 最高気温18度',
    mainArticle: {
      headline: '新年度幕開け 平成二年の春到来',
      subheadline: '全国各地で入社式・入学式 新たな門出を祝う',
      content: '四月一日、全国各地で新年度の幕が開いた。企業では入社式が執り行われ、真新しいスーツに身を包んだ新入社員たちが緊張した面持ちで社会人としての第一歩を踏み出した。東京都内の大手企業では、約五百名の新入社員が一堂に会し、社長訓示に耳を傾けた。「平成の時代を担う若者として、創造性と挑戦心を忘れずに」との言葉に、新入社員たちは力強く頷いていた。一方、学校では入学式が行われ、桜の花びらが舞う中、新一年生たちが校門をくぐった。少子化の影響が懸念される中、教育現場では一人ひとりの個性を大切にする教育方針が打ち出されている。',
      category: 'main',
      imagePrompt: 'Japanese company entrance ceremony 1990, new employees in suits, cherry blossoms, vintage newspaper photo style',
    },
    subArticles: [
      {
        headline: '日経平均株価 三万円台を維持',
        content: '東京株式市場は堅調な動きを見せ、日経平均株価は三万円台を維持した。バブル景気の恩恵を受け、企業業績は好調を維持している。市場関係者は「当面は高値圏での推移が続く」との見方を示している。',
        category: 'economy',
        imagePrompt: 'Tokyo stock exchange 1990, traders, electronic board showing numbers, vintage Japanese newspaper photo',
      },
      {
        headline: '春の選抜高校野球 熱戦続く',
        content: '第六十二回選抜高等学校野球大会は甲子園球場で熱戦が繰り広げられている。各地の代表校が白球を追い、球児たちの真剣な眼差しがスタンドの観客を魅了した。',
        category: 'sports',
        imagePrompt: 'Koshien baseball stadium 1990, high school baseball players, cheering crowd, vintage sports photography',
      },
      {
        headline: '新元号「平成」二年目の春',
        content: '昭和から平成へと時代が移り、二度目の春を迎えた。国民生活にも新時代の空気が浸透し、若者文化を中心に新たな潮流が生まれつつある。',
        category: 'society',
        imagePrompt: 'Japanese street scene 1990, fashion, young people, colorful clothes, vintage photography style',
      },
    ],
    editorial: {
      headline: '新時代を生きる若者たちへ',
      content: '平成二年の春、新たな門出を迎えた若者たちに贈る言葉がある。激動の昭和を経て、我が国は世界有数の経済大国となった。しかし、真の豊かさとは何か。物質的な繁栄のみならず、心の豊かさ、人と人との繋がりを大切にする社会の実現こそが、これからの時代に求められる。新入社員諸君、新入生諸君。困難に直面したとき、諦めずに立ち向かう勇気を持ち続けてほしい。諸君の双肩には、この国の未来がかかっているのである。',
      category: 'editorial',
    },
    columnTitle: '天声人語',
    columnContent: '桜前線が列島を北上する季節となった。花びらが風に舞う様は、古来より日本人の心を捉えて離さない。散りゆく花に儚さを見出し、だからこそ今この瞬間を大切にする。そんな美意識が、この国の文化の根底に流れている。',
    advertisements: [
      {
        title: '春の新生活応援セール',
        content: '家電・家具が特別価格！ 新生活を応援します。全国のデパートにて開催中。',
        style: 'vintage',
      },
      {
        title: '国鉄からJRへ',
        content: '新しい鉄道の時代。快適な旅をお届けします。春の行楽にJRをご利用ください。',
        style: 'vintage',
      },
      {
        title: '資生堂 春の新色',
        content: '花咲く季節に、あなたも輝く。新作口紅「桜色の誘惑」発売中。',
        style: 'vintage',
      },
    ],
    personalMessage: {
      recipientName: '山田 太郎',
      senderName: 'ご家族一同',
      message: 'お誕生日おめでとうございます。あなたが生まれたこの日、世界はこんなニュースで溢れていました。',
      occasion: '誕生日',
    },
  },

  // サンプル3: 昭和風 - 1964年10月10日（東京オリンピック開会式）
  {
    date: new Date('1964-10-10'),
    masthead: '時空新報',
    edition: '第3,456号 特別号',
    weather: '快晴 最高気温20度',
    mainArticle: {
      headline: '東京五輪 華やかに開幕',
      subheadline: '国立競技場に七万の歓声 聖火台に炎燃ゆ',
      content: '第十八回オリンピック東京大会は十日午後二時、東京・国立競技場において盛大に開会式が挙行された。秋晴れの青空の下、九十四カ国から集った選手団約五千五百名が次々と入場行進を行い、七万人の観衆は惜しみない拍手を送った。日本選手団は最後に入場し、旗手を先頭に堂々の行進。場内は歓声に包まれた。式典のクライマックスでは、最終聖火ランナーの坂井義則選手が聖火台への階段を駆け上がり、高らかに燃え上がる炎に場内は感動の渦に包まれた。戦後復興を遂げた日本が、世界に平和の祭典を届ける歴史的瞬間となった。',
      category: 'main',
      imagePrompt: '1964 Tokyo Olympics opening ceremony, National Stadium, athletes marching, Japanese flags, vintage black and white newspaper photo',
    },
    subArticles: [
      {
        headline: '新幹線「夢の超特急」好調',
        content: '十月一日に開業した東海道新幹線は連日満席の盛況。東京ー新大阪間を四時間で結ぶ「夢の超特急」に、利用客は「まるで飛行機のよう」と驚きの声を上げている。',
        category: 'society',
        imagePrompt: '1964 Shinkansen bullet train, Tokyo station platform, passengers, vintage black and white Japanese newspaper photo',
      },
      {
        headline: '首都高速 五輪に間に合う',
        content: '東京オリンピックに合わせて建設が進められていた首都高速道路が完成。近代都市東京の新たな大動脈として、交通事情の改善が期待されている。',
        category: 'economy',
        imagePrompt: '1964 Tokyo expressway construction completion, highway, cars, vintage monochrome newspaper photography',
      },
      {
        headline: '日本選手団 金メダル期待',
        content: '柔道、体操、レスリングなど、日本のお家芸での金メダル獲得が期待される。選手団主将の小野喬選手は「必ずや国民の期待に応えたい」と決意を語った。',
        category: 'sports',
        imagePrompt: '1964 Tokyo Olympics Japanese athletes, judo or gymnastics, determined faces, vintage black and white sports photography',
      },
    ],
    editorial: {
      headline: '平和の祭典に寄せて',
      content: '十九年前、焦土と化したこの東京に、今日、世界中から若人が集った。廃墟から立ち上がり、奇跡的な復興を遂げた我が国が、平和の祭典を主催する日が来ようとは、あの終戦の日に誰が想像し得ただろうか。聖火台に燃える炎は、平和への誓いの象徴である。二度と戦争の惨禍を繰り返してはならない。このオリンピックを通じて、世界の若者たちが友情を育み、相互理解を深めることを切に願う。今日この日を、新しい日本の出発点としたい。',
      category: 'editorial',
    },
    columnTitle: '天声人語',
    columnContent: '青空に五つの輪が描かれた。赤、青、黄、緑、黒。五大陸の結束を象徴するオリンピックの輪が、東京の空に翻っている。戦争で断ち切られた世界との絆を、スポーツという共通言語が再び結び直す。この日の感動を、私たちは永く記憶に留めたい。',
    advertisements: [
      {
        title: '東京オリンピック記念',
        content: '記念切手・記念硬貨 発売中。郵便局にてお買い求めください。',
        style: 'vintage',
      },
      {
        title: 'ナショナル テレビ',
        content: 'オリンピックを鮮明な画面で。カラーテレビ新発売。',
        style: 'vintage',
      },
      {
        title: '日本航空',
        content: '世界への翼 JAL。オリンピックで広がる国際交流を応援します。',
        style: 'vintage',
      },
    ],
    personalMessage: {
      recipientName: '鈴木 正夫',
      senderName: 'ご家族一同',
      message: '還暦おめでとうございます。あなたが生まれたこの日、東京オリンピックが開幕しました。日本中が希望に満ちていたあの日から60年。これからも健康で。',
      occasion: '還暦祝い',
    },
  },
];

// サンプル表示用のメタ情報（令和→平成→昭和の順）
export const sampleMeta = [
  {
    id: 'reiwa-2020',
    title: '令和風の新聞',
    description: '2020年7月24日 - コロナ禍の東京',
    occasion: '誕生日',
    style: 'reiwa' as const,
  },
  {
    id: 'heisei-1990',
    title: '平成風の新聞',
    description: '1990年4月1日 - 平成二年の春',
    occasion: '誕生日',
    style: 'heisei' as const,
  },
  {
    id: 'showa-1964',
    title: '昭和風の新聞',
    description: '1964年10月10日 - 東京オリンピック開幕',
    occasion: '還暦祝い',
    style: 'showa' as const,
  },
];
