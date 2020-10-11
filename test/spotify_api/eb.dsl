<map version="1.1.2">
<!-- Diagrama de Concepto DSL. Para ver este archivo use Creador Concepto DSL de http://www.creador.cl -->
<node CREATED="1593901112557" ID="ID_456147912" MODIFIED="1594524714822" TEXT="api-so">
<attribute_layout NAME_WIDTH="89" VALUE_WIDTH="152"/>
<attribute NAME="log" VALUE="console"/>
<attribute NAME="modelos" VALUE="aurora"/>
<attribute NAME="version" VALUE="1.1.6"/>
<attribute NAME="deploybak" VALUE="eb:spotify-so,so-api"/>
<attribute NAME="deploy" VALUE="eb:spotify-so,so-api"/>
<attribute NAME="rtc" VALUE="true"/>
<attribute NAME="rtc:admin" VALUE="masteradmin,notelasabes"/>
<node CREATED="1553569481672" ID="ID_861168397" MODIFIED="1593901120918" POSITION="left" TEXT="config">
<icon BUILTIN="desktop_new"/>
<node CREATED="1553569481672" ID="ID_1162429478" MODIFIED="1597100308799" TEXT="aws">
<attribute_layout NAME_WIDTH="67" VALUE_WIDTH="300"/>
<attribute NAME="access" VALUE="AKIAQZPPEWXHQDGYEZS3"/>
<attribute NAME="secret" VALUE="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"/>
<attribute NAME="region" VALUE="us-east-1"/>
</node>
<node CREATED="1586285191244" ID="ID_1231195426" MODIFIED="1594071866779" TEXT="aurora">
<attribute_layout NAME_WIDTH="82" VALUE_WIDTH="438"/>
<attribute NAME="host" VALUE="youtube-down.cpdzk71b6jow.us-east-1.rds.amazonaws.com"/>
<attribute NAME="port" VALUE="3306"/>
<attribute NAME="name" VALUE="spotifyso"/>
<attribute NAME="user" VALUE="youmaster"/>
<attribute NAME="password" VALUE="YoTengoExito2020"/>
</node>
</node>
<node CREATED="1594071739923" ID="ID_632593451" MODIFIED="1594355678794" POSITION="left" TEXT="modelos">
<icon BUILTIN="desktop_new"/>
<attribute NAME="alter" VALUE="false"/>
<attribute NAME="log" VALUE="false"/>
<node CREATED="1594072001523" ID="ID_1515784737" MODIFIED="1594312414638" TEXT="users">
<icon BUILTIN="xmag"/>
<attribute_layout NAME_WIDTH="112"/>
<attribute NAME="id" VALUE="id"/>
<attribute NAME="user_id" VALUE="string"/>
<attribute NAME="display_name" VALUE="string"/>
<attribute NAME="public_url" VALUE="string"/>
<attribute NAME="user_api_url" VALUE="string"/>
<attribute NAME="followers" VALUE="int"/>
<attribute NAME="image" VALUE="text"/>
<attribute NAME="uses" VALUE="int"/>
<attribute NAME="token" VALUE="string"/>
<attribute NAME="sesion" VALUE="string"/>
<attribute NAME="karaoke" VALUE="boolean"/>
</node>
<node CREATED="1594071744674" ID="ID_278478096" MODIFIED="1594144882137" TEXT="tracks">
<icon BUILTIN="xmag"/>
<attribute_layout NAME_WIDTH="103" VALUE_WIDTH="85"/>
<attribute NAME="id" VALUE="id"/>
<attribute NAME="search_query" VALUE="string"/>
<attribute NAME="spotify_songid" VALUE="string"/>
<attribute NAME="youtube_link" VALUE="string"/>
<attribute NAME="times" VALUE="int"/>
</node>
</node>
<node CREATED="1593903695799" ID="ID_879669278" MODIFIED="1593905587647" POSITION="right" TEXT="spotify">
<icon BUILTIN="list"/>
<node CREATED="1593451774287" FOLDED="true" ID="ID_35026223" MODIFIED="1594350410206" TEXT="getToken">
<attribute_layout NAME_WIDTH="124" VALUE_WIDTH="331"/>
<attribute NAME="type" VALUE="POST"/>
<attribute NAME="params" VALUE="code*,client_id*,client_secret*,host*"/>
<attribute NAME="code:string" VALUE="Code de spotify"/>
<attribute NAME="client_id:string" VALUE="Client ID de app"/>
<attribute NAME="client_secret:string" VALUE="Cliente Secret de app"/>
<attribute NAME="host:string" VALUE="redirect host used at login"/>
<attribute NAME="return" VALUE="resp"/>
<attribute NAME="return:object" VALUE="{ error:0, message:&apos;ok&apos;, data:{ access_token:&apos;x&apos; } }"/>
<node CREATED="1553569481674" ID="ID_1946012567" MODIFIED="1593665227196" TEXT="condicion si falta parametro &quot;*&quot;">
<icon BUILTIN="help"/>
<node CREATED="1593638729329" ID="ID_1788838776" MODIFIED="1593645657864" TEXT="getToken dice que falto param">
<icon BUILTIN="clanbomber"/>
</node>
<node CREATED="1553569481674" ID="ID_1209704641" MODIFIED="1553569481674" TEXT="struct, resp">
<icon BUILTIN="desktop_new"/>
<attribute_layout NAME_WIDTH="68" VALUE_WIDTH="106"/>
<attribute NAME="error" VALUE="400"/>
<attribute NAME="mensaje" VALUE="falta parametro"/>
</node>
</node>
<node CREATED="1593451947940" ID="ID_1306380374" MODIFIED="1593451950529" TEXT="otra condicion">
<icon BUILTIN="help"/>
<node CREATED="1593648638449" ID="ID_746514183" MODIFIED="1593664540409" TEXT="var auth_header = &apos;Basic &apos; + (new Buffer.from(params.client_id + &apos;:&apos; + params.client_secret).toString(&apos;base64&apos;));">
<icon BUILTIN="penguin"/>
</node>
<node CREATED="1593915714174" ID="ID_1542020711" MODIFIED="1593915715841" TEXT="http://www.spotify.so/callback">
<icon BUILTIN="button_cancel"/>
</node>
<node CREATED="1553569412219" ID="ID_1726078808" MODIFIED="1593916339888" TEXT="consultar web, spot">
<icon BUILTIN="desktop_new"/>
<icon BUILTIN="bell"/>
<attribute_layout NAME_WIDTH="129" VALUE_WIDTH="349"/>
<attribute NAME=":url" VALUE="https://accounts.spotify.com/api/token"/>
<attribute NAME=":method" VALUE="postjson"/>
<attribute NAME=":progress" VALUE="true"/>
<attribute NAME="code" VALUE="**params.code**"/>
<attribute NAME="redirect_uri" VALUE="**params.host**"/>
<attribute NAME="grant_type" VALUE="authorization_code"/>
<attribute NAME="x-:Authorization" VALUE="**auth_header**"/>
</node>
<node CREATED="1553569481674" ID="ID_1596031213" MODIFIED="1593651591757" TEXT="struct, resp">
<icon BUILTIN="desktop_new"/>
<icon BUILTIN="bell"/>
<attribute_layout NAME_WIDTH="113" VALUE_WIDTH="135"/>
<attribute NAME="error" VALUE="0"/>
<attribute NAME="mensaje" VALUE="ok"/>
<attribute NAME="access_token" VALUE="**spot.access_token**"/>
<attribute NAME="refresh_token" VALUE="**spot.refresh_token**"/>
<attribute NAME="expires_in" VALUE="**spot.expires_in**"/>
</node>
</node>
</node>
<node CREATED="1593664913451" FOLDED="true" ID="ID_645580587" MODIFIED="1598675483048" TEXT="infoUsuario">
<attribute NAME="type" VALUE="POST"/>
<attribute NAME="params" VALUE="token*"/>
<attribute NAME="return" VALUE="resp"/>
<node CREATED="1593664917617" ID="ID_1744313504" MODIFIED="1593664927572" TEXT="condicion si falta parametro &quot;*&quot;">
<icon BUILTIN="help"/>
<node CREATED="1553569481674" ID="ID_889708262" MODIFIED="1553569481674" TEXT="struct, resp">
<icon BUILTIN="desktop_new"/>
<attribute_layout NAME_WIDTH="68" VALUE_WIDTH="106"/>
<attribute NAME="error" VALUE="400"/>
<attribute NAME="mensaje" VALUE="falta parametro"/>
</node>
</node>
<node CREATED="1593664924464" ID="ID_535154562" MODIFIED="1598669353043" TEXT="otra condicion">
<icon BUILTIN="help"/>
<node CREATED="1593664930318" ID="ID_603107373" MODIFIED="1593665239718" TEXT="curl -X GET &quot;https://api.spotify.com/v1/users/wizzler/playlists&quot; -H &quot;Authorization: Bearer {your access token}&quot;">
<icon BUILTIN="button_cancel"/>
</node>
<node CREATED="1593648638449" ID="ID_112877194" MODIFIED="1593665187033" TEXT="var auth_header = &apos;Bearer &apos; + params.token;">
<icon BUILTIN="penguin"/>
</node>
<node CREATED="1553569412219" ID="ID_1398575630" MODIFIED="1593665208360" TEXT="consultar web, info">
<icon BUILTIN="desktop_new"/>
<icon BUILTIN="bell"/>
<attribute_layout NAME_WIDTH="129" VALUE_WIDTH="349"/>
<attribute NAME=":url" VALUE="https://api.spotify.com/v1/me"/>
<attribute NAME=":method" VALUE="get"/>
<attribute NAME=":progress" VALUE="false"/>
<attribute NAME="x-:Authorization" VALUE="**auth_header**"/>
</node>
<node CREATED="1594145157504" ID="ID_884488673" MODIFIED="1594145164833" TEXT="-guardamos copia en BD">
<icon BUILTIN="button_cancel"/>
</node>
<node CREATED="1594145166135" ID="ID_1703904273" MODIFIED="1594145194818" TEXT="consultar modelo &quot;users&quot;, existe">
<icon BUILTIN="desktop_new"/>
<icon BUILTIN="bell"/>
<attribute NAME="user_id" VALUE="**info.id**"/>
</node>
<node CREATED="1594167705505" ID="ID_978217214" MODIFIED="1594167714438" TEXT="-generamos llave de sesion">
<icon BUILTIN="button_cancel"/>
</node>
<node CREATED="1594167717093" ID="ID_1456165172" MODIFIED="1594167733130" TEXT="npm:instalar &quot;keygenerator&quot;, keygen">
<icon BUILTIN="desktop_new"/>
<attribute NAME="require" VALUE="true"/>
</node>
<node CREATED="1594167735070" ID="ID_167364621" MODIFIED="1594167761830" TEXT="let sesion = keygen.session_id();">
<icon BUILTIN="penguin"/>
</node>
<node CREATED="1594145198874" ID="ID_1762771822" MODIFIED="1594145208624" TEXT="condicion si &quot;**existe**&quot; contiene registros">
<icon BUILTIN="help"/>
<icon BUILTIN="bell"/>
<node CREATED="1594145217112" ID="ID_93417628" LINK="#ID_1703904273" MODIFIED="1594312436134" TEXT="modificar modelo">
<icon BUILTIN="desktop_new"/>
<icon BUILTIN="bell"/>
<attribute_layout NAME_WIDTH="100" VALUE_WIDTH="168"/>
<attribute NAME="display_name" VALUE="**info.display_name**"/>
<attribute NAME="public_url" VALUE="**info.external_urls.spotify**"/>
<attribute NAME="followers" VALUE="**info.followers.total**"/>
<attribute NAME="image" VALUE="**info.images[0].url**"/>
<attribute NAME="uses" VALUE="**existe[0].uses+1**"/>
<attribute NAME="token" VALUE="**params.token**"/>
<attribute NAME="sesion" VALUE="**sesion**"/>
</node>
<node CREATED="1594318841245" ID="ID_1497849257" MODIFIED="1594318853673" TEXT="info.karaoke=existe[0].karaoke;">
<icon BUILTIN="penguin"/>
</node>
</node>
<node CREATED="1594145208947" ID="ID_1203332374" MODIFIED="1594145213013" TEXT="otra condicion">
<icon BUILTIN="help"/>
<node CREATED="1594145217112" ID="ID_1075248082" MODIFIED="1594312441143" TEXT="insertar modelo &quot;users&quot;">
<icon BUILTIN="desktop_new"/>
<icon BUILTIN="bell"/>
<attribute_layout NAME_WIDTH="82" VALUE_WIDTH="168"/>
<attribute NAME="user_id" VALUE="**info.id**"/>
<attribute NAME="display_name" VALUE="**info.display_name**"/>
<attribute NAME="public_url" VALUE="**info.external_urls.spotify**"/>
<attribute NAME="user_api_url" VALUE="**info.href**"/>
<attribute NAME="followers" VALUE="**info.followers.total**"/>
<attribute NAME="image" VALUE="**info.images[0].url**"/>
<attribute NAME="uses" VALUE="1"/>
<attribute NAME="token" VALUE="**params.token**"/>
<attribute NAME="sesion" VALUE="**sesion**"/>
<attribute NAME="karaoke" VALUE="false"/>
</node>
<node CREATED="1594318841245" ID="ID_235085380" MODIFIED="1594318862784" TEXT="info.karaoke=false;">
<icon BUILTIN="penguin"/>
</node>
</node>
<node CREATED="1594312381766" ID="ID_1255986539" MODIFIED="1594312383955" TEXT="respondemos">
<icon BUILTIN="button_cancel"/>
</node>
<node CREATED="1553569481674" ID="ID_858989672" MODIFIED="1594312380811" TEXT="struct, resp">
<icon BUILTIN="desktop_new"/>
<icon BUILTIN="bell"/>
<attribute_layout NAME_WIDTH="113" VALUE_WIDTH="135"/>
<attribute NAME="error" VALUE="0"/>
<attribute NAME="mensaje" VALUE="ok"/>
<attribute NAME="data" VALUE="**info**"/>
<attribute NAME="sesion" VALUE="**sesion**"/>
</node>
</node>
</node>
<node CREATED="1594312443855" FOLDED="true" ID="ID_219343987" MODIFIED="1595303718839" TEXT="toggleKaraoke">
<attribute NAME="type" VALUE="POST"/>
<attribute NAME="params" VALUE="sesion*"/>
<attribute NAME="return" VALUE="resp"/>
<node CREATED="1593664917617" ID="ID_1706459819" MODIFIED="1593664927572" TEXT="condicion si falta parametro &quot;*&quot;">
<icon BUILTIN="help"/>
<node CREATED="1553569481674" ID="ID_1017996006" MODIFIED="1553569481674" TEXT="struct, resp">
<icon BUILTIN="desktop_new"/>
<attribute_layout NAME_WIDTH="68" VALUE_WIDTH="106"/>
<attribute NAME="error" VALUE="400"/>
<attribute NAME="mensaje" VALUE="falta parametro"/>
</node>
</node>
<node CREATED="1594312483154" ID="ID_987757851" MODIFIED="1594312487967" TEXT="otra condicion">
<icon BUILTIN="help"/>
<node CREATED="1553569481674" ID="ID_295881354" MODIFIED="1594312532184" TEXT="struct, resp">
<icon BUILTIN="desktop_new"/>
<attribute_layout NAME_WIDTH="68" VALUE_WIDTH="106"/>
<attribute NAME="error" VALUE="0"/>
<attribute NAME="mensaje" VALUE="ok"/>
</node>
<node CREATED="1594145166135" ID="ID_1541167360" MODIFIED="1594167811836" TEXT="consultar modelo &quot;users&quot;, existe">
<icon BUILTIN="desktop_new"/>
<icon BUILTIN="bell"/>
<attribute_layout NAME_WIDTH="60" VALUE_WIDTH="117"/>
<attribute NAME="sesion" VALUE="**params.sesion**"/>
</node>
<node CREATED="1594166573985" ID="ID_1703221989" MODIFIED="1594166583590" TEXT="condicion si &quot;**existe**&quot; contiene registros">
<icon BUILTIN="help"/>
<icon BUILTIN="bell"/>
<node CREATED="1594312669556" ID="ID_916338382" MODIFIED="1594312683313" TEXT="condicion si &quot;**existe[0].karaoke**&quot; es &quot;true&quot;">
<icon BUILTIN="help"/>
<icon BUILTIN="bell"/>
<node CREATED="1594312690470" ID="ID_1869405951" LINK="#ID_1541167360" MODIFIED="1594312752086" TEXT="modificar modelo">
<icon BUILTIN="desktop_new"/>
<attribute NAME="karaoke" VALUE="false"/>
</node>
</node>
<node CREATED="1594312683645" ID="ID_1129116728" MODIFIED="1594312687783" TEXT="otra condicion">
<icon BUILTIN="help"/>
<node CREATED="1594312690470" ID="ID_1792003175" LINK="#ID_1541167360" MODIFIED="1594312759410" TEXT="modificar modelo">
<icon BUILTIN="desktop_new"/>
<attribute NAME="karaoke" VALUE="true"/>
</node>
</node>
</node>
<node CREATED="1594312517312" ID="ID_70120362" MODIFIED="1594312520714" TEXT="otra condicion">
<icon BUILTIN="help"/>
<node CREATED="1594312714727" ID="ID_1189562768" MODIFIED="1594312739098" TEXT="extender &quot;resp&quot;">
<icon BUILTIN="desktop_new"/>
<attribute_layout NAME_WIDTH="74" VALUE_WIDTH="86"/>
<attribute NAME="error" VALUE="100"/>
<attribute NAME="mensaje" VALUE="invalid session"/>
</node>
</node>
</node>
</node>
<node CREATED="1593664913451" FOLDED="true" ID="ID_609133859" MODIFIED="1594312352076" TEXT="getPlaylists">
<attribute_layout NAME_WIDTH="76" VALUE_WIDTH="87"/>
<attribute NAME="type" VALUE="POST"/>
<attribute NAME="params" VALUE="token*,iduser*"/>
<attribute NAME="return" VALUE="resp"/>
<node CREATED="1593664917617" ID="ID_838029112" MODIFIED="1593664927572" TEXT="condicion si falta parametro &quot;*&quot;">
<icon BUILTIN="help"/>
<node CREATED="1553569481674" ID="ID_300784443" MODIFIED="1553569481674" TEXT="struct, resp">
<icon BUILTIN="desktop_new"/>
<attribute_layout NAME_WIDTH="68" VALUE_WIDTH="106"/>
<attribute NAME="error" VALUE="400"/>
<attribute NAME="mensaje" VALUE="falta parametro"/>
</node>
</node>
<node CREATED="1593664924464" ID="ID_29606257" MODIFIED="1593664927572" TEXT="otra condicion">
<icon BUILTIN="help"/>
<node CREATED="1593648638449" ID="ID_731686269" MODIFIED="1593665187033" TEXT="var auth_header = &apos;Bearer &apos; + params.token;">
<icon BUILTIN="penguin"/>
</node>
<node CREATED="1553569412219" ID="ID_1768837648" MODIFIED="1594181413802" TEXT="consultar web, info">
<icon BUILTIN="desktop_new"/>
<icon BUILTIN="bell"/>
<attribute_layout NAME_WIDTH="129" VALUE_WIDTH="349"/>
<attribute NAME=":url" VALUE="https://api.spotify.com/v1/users/**params.iduser**/playlists"/>
<attribute NAME=":method" VALUE="get"/>
<attribute NAME=":progress" VALUE="false"/>
<attribute NAME="limit" VALUE="50"/>
<attribute NAME="x-:Authorization" VALUE="**auth_header**"/>
</node>
<node CREATED="1553569481674" ID="ID_1781494835" MODIFIED="1593665216805" TEXT="struct, resp">
<icon BUILTIN="desktop_new"/>
<icon BUILTIN="bell"/>
<attribute_layout NAME_WIDTH="113" VALUE_WIDTH="135"/>
<attribute NAME="error" VALUE="0"/>
<attribute NAME="mensaje" VALUE="ok"/>
<attribute NAME="data" VALUE="**info**"/>
</node>
</node>
</node>
<node CREATED="1593664913451" FOLDED="true" ID="ID_1955704623" MODIFIED="1594350402905" TEXT="getTracks">
<attribute_layout NAME_WIDTH="47" VALUE_WIDTH="102"/>
<attribute NAME="type" VALUE="POST"/>
<attribute NAME="params" VALUE="token*,idplaylist*"/>
<attribute NAME="return" VALUE="resp"/>
<node CREATED="1593664917617" ID="ID_72792928" MODIFIED="1593664927572" TEXT="condicion si falta parametro &quot;*&quot;">
<icon BUILTIN="help"/>
<node CREATED="1553569481674" ID="ID_4261914" MODIFIED="1553569481674" TEXT="struct, resp">
<icon BUILTIN="desktop_new"/>
<attribute_layout NAME_WIDTH="68" VALUE_WIDTH="106"/>
<attribute NAME="error" VALUE="400"/>
<attribute NAME="mensaje" VALUE="falta parametro"/>
</node>
</node>
<node CREATED="1593664924464" ID="ID_1130629665" MODIFIED="1593664927572" TEXT="otra condicion">
<icon BUILTIN="help"/>
<node CREATED="1594148049602" ID="ID_1811698424" MODIFIED="1594148053599" TEXT="probar">
<icon BUILTIN="broken-line"/>
<node CREATED="1594148054124" ID="ID_1552298921" MODIFIED="1594148055501" TEXT="error">
<icon BUILTIN="help"/>
<node CREATED="1553569481674" ID="ID_1575735466" MODIFIED="1594148072302" TEXT="struct, resp">
<icon BUILTIN="desktop_new"/>
<attribute_layout NAME_WIDTH="68" VALUE_WIDTH="106"/>
<attribute NAME="error" VALUE="402"/>
<attribute NAME="mensaje" VALUE="error consultando"/>
</node>
</node>
<node CREATED="1593648638449" ID="ID_1331501820" MODIFIED="1594148056849" TEXT="var auth_header = &apos;Bearer &apos; + params.token;">
<icon BUILTIN="penguin"/>
</node>
<node CREATED="1553569412219" ID="ID_1955892373" MODIFIED="1593830977308" TEXT="consultar web, info">
<icon BUILTIN="desktop_new"/>
<icon BUILTIN="bell"/>
<attribute_layout NAME_WIDTH="123" VALUE_WIDTH="378"/>
<attribute NAME=":url" VALUE="https://api.spotify.com/v1/playlists/**params.idplaylist**/tracks"/>
<attribute NAME=":method" VALUE="get"/>
<attribute NAME=":progress" VALUE="false"/>
<attribute NAME="x-:Authorization" VALUE="**auth_header**"/>
</node>
<node CREATED="1594179475509" FOLDED="true" ID="ID_1102117066" MODIFIED="1594179817556" TEXT="condicion si &quot;**info.total**&quot; es mayor que &quot;200&quot;">
<icon BUILTIN="help"/>
<icon BUILTIN="bell"/>
<node CREATED="1594179731421" ID="ID_806028364" MODIFIED="1594179740920" TEXT="-copiamos de 0-100 items">
<icon BUILTIN="button_cancel"/>
</node>
<node CREATED="1594179525805" ID="ID_1838878436" MODIFIED="1594179534280" TEXT="let tmp=info;">
<icon BUILTIN="penguin"/>
</node>
<node CREATED="1594179744418" ID="ID_929583622" MODIFIED="1594179759107" TEXT="-agregamos items 100-200">
<icon BUILTIN="button_cancel"/>
</node>
<node CREATED="1553569412219" ID="ID_1869724888" MODIFIED="1594179633330" TEXT="consultar web, info1">
<icon BUILTIN="desktop_new"/>
<icon BUILTIN="bell"/>
<attribute_layout NAME_WIDTH="123" VALUE_WIDTH="378"/>
<attribute NAME=":url" VALUE="https://api.spotify.com/v1/playlists/**params.idplaylist**/tracks"/>
<attribute NAME=":method" VALUE="get"/>
<attribute NAME=":progress" VALUE="false"/>
<attribute NAME="offset" VALUE="100"/>
<attribute NAME="x-:Authorization" VALUE="**auth_header**"/>
</node>
<node CREATED="1594179637249" ID="ID_1913098347" MODIFIED="1594179727280" TEXT="tmp.items = tmp.items.concat(info1.items);">
<icon BUILTIN="penguin"/>
</node>
<node CREATED="1594179744418" ID="ID_634650980" MODIFIED="1594179773641" TEXT="-agregamos items 200+">
<icon BUILTIN="button_cancel"/>
</node>
<node CREATED="1553569412219" ID="ID_314973835" MODIFIED="1594179784488" TEXT="consultar web, info2">
<icon BUILTIN="desktop_new"/>
<icon BUILTIN="bell"/>
<attribute_layout NAME_WIDTH="123" VALUE_WIDTH="378"/>
<attribute NAME=":url" VALUE="https://api.spotify.com/v1/playlists/**params.idplaylist**/tracks"/>
<attribute NAME=":method" VALUE="get"/>
<attribute NAME=":progress" VALUE="false"/>
<attribute NAME="offset" VALUE="200"/>
<attribute NAME="x-:Authorization" VALUE="**auth_header**"/>
</node>
<node CREATED="1594179637249" ID="ID_845564949" MODIFIED="1594179791236" TEXT="tmp.items = tmp.items.concat(info2.items);">
<icon BUILTIN="penguin"/>
</node>
<node CREATED="1553569481674" ID="ID_373032224" MODIFIED="1594179809350" TEXT="struct, resp">
<icon BUILTIN="desktop_new"/>
<icon BUILTIN="bell"/>
<attribute_layout NAME_WIDTH="113" VALUE_WIDTH="135"/>
<attribute NAME="error" VALUE="0"/>
<attribute NAME="mensaje" VALUE="ok, superior 200"/>
<attribute NAME="data" VALUE="**tmp**"/>
</node>
</node>
<node CREATED="1594179475509" ID="ID_1345708248" MODIFIED="1594179811768" TEXT="condicion si &quot;**info.total**&quot; es mayor que &quot;100&quot;">
<icon BUILTIN="help"/>
<icon BUILTIN="bell"/>
<node CREATED="1594179731421" ID="ID_1460683786" MODIFIED="1594179740920" TEXT="-copiamos de 0-100 items">
<icon BUILTIN="button_cancel"/>
</node>
<node CREATED="1594179525805" ID="ID_1050621119" MODIFIED="1594179534280" TEXT="let tmp=info;">
<icon BUILTIN="penguin"/>
</node>
<node CREATED="1594179744418" ID="ID_839736866" MODIFIED="1594179759107" TEXT="-agregamos items 100-200">
<icon BUILTIN="button_cancel"/>
</node>
<node CREATED="1553569412219" ID="ID_1219192538" MODIFIED="1594179633330" TEXT="consultar web, info1">
<icon BUILTIN="desktop_new"/>
<icon BUILTIN="bell"/>
<attribute_layout NAME_WIDTH="123" VALUE_WIDTH="378"/>
<attribute NAME=":url" VALUE="https://api.spotify.com/v1/playlists/**params.idplaylist**/tracks"/>
<attribute NAME=":method" VALUE="get"/>
<attribute NAME=":progress" VALUE="false"/>
<attribute NAME="offset" VALUE="100"/>
<attribute NAME="x-:Authorization" VALUE="**auth_header**"/>
</node>
<node CREATED="1594179637249" ID="ID_1100700867" MODIFIED="1594179727280" TEXT="tmp.items = tmp.items.concat(info1.items);">
<icon BUILTIN="penguin"/>
</node>
<node CREATED="1553569481674" ID="ID_732993378" MODIFIED="1594179836181" TEXT="struct, resp">
<icon BUILTIN="desktop_new"/>
<icon BUILTIN="bell"/>
<attribute_layout NAME_WIDTH="113" VALUE_WIDTH="135"/>
<attribute NAME="error" VALUE="0"/>
<attribute NAME="mensaje" VALUE="ok, entre 100 y 200"/>
<attribute NAME="data" VALUE="**tmp**"/>
</node>
</node>
<node CREATED="1594179490762" ID="ID_1772236331" MODIFIED="1594179493259" TEXT="otra condicion">
<icon BUILTIN="help"/>
<node CREATED="1553569481674" ID="ID_724500162" MODIFIED="1593665216805" TEXT="struct, resp">
<icon BUILTIN="desktop_new"/>
<icon BUILTIN="bell"/>
<attribute_layout NAME_WIDTH="113" VALUE_WIDTH="135"/>
<attribute NAME="error" VALUE="0"/>
<attribute NAME="mensaje" VALUE="ok"/>
<attribute NAME="data" VALUE="**info**"/>
</node>
</node>
</node>
</node>
</node>
<node CREATED="1593839040986" ID="ID_545349459" MODIFIED="1594146523076" TEXT="getLink">
<attribute_layout NAME_WIDTH="68" VALUE_WIDTH="85"/>
<attribute NAME="type" VALUE="POST"/>
<attribute NAME="params" VALUE="search_name*"/>
<attribute NAME="return" VALUE="resp"/>
<node CREATED="1593664917617" ID="ID_1129577205" MODIFIED="1593664927572" TEXT="condicion si falta parametro &quot;*&quot;">
<icon BUILTIN="help"/>
<node CREATED="1553569481674" ID="ID_52257016" MODIFIED="1553569481674" TEXT="struct, resp">
<icon BUILTIN="desktop_new"/>
<attribute_layout NAME_WIDTH="68" VALUE_WIDTH="106"/>
<attribute NAME="error" VALUE="400"/>
<attribute NAME="mensaje" VALUE="falta parametro"/>
</node>
</node>
<node CREATED="1593664924464" FOLDED="true" ID="ID_1369765690" MODIFIED="1594146849900" TEXT="otra condicion">
<icon BUILTIN="help"/>
<node CREATED="1553569481674" ID="ID_674214413" MODIFIED="1593877601862" TEXT="struct, resp">
<icon BUILTIN="desktop_new"/>
<icon BUILTIN="bell"/>
<attribute_layout NAME_WIDTH="113" VALUE_WIDTH="135"/>
<attribute NAME="error" VALUE="0"/>
<attribute NAME="mensaje" VALUE="ok"/>
</node>
<node CREATED="1593839136447" ID="ID_78518841" MODIFIED="1593839140281" TEXT="const { promisify } = require(&apos;util&apos;);">
<icon BUILTIN="penguin"/>
</node>
<node CREATED="1594145466130" ID="ID_167947467" MODIFIED="1594145470146" TEXT="-vemos cache">
<icon BUILTIN="button_cancel"/>
</node>
<node CREATED="1594145474769" ID="ID_1020360484" MODIFIED="1594145511232" TEXT="consultar modelo &quot;tracks&quot;, existe">
<icon BUILTIN="desktop_new"/>
<icon BUILTIN="bell"/>
<attribute_layout NAME_WIDTH="107" VALUE_WIDTH="151"/>
<attribute NAME="search_query" VALUE="**params.search_name**"/>
</node>
<node CREATED="1594145532978" ID="ID_1100268259" MODIFIED="1594145543665" TEXT="condicion si &quot;**existe**&quot; contiene registros">
<icon BUILTIN="help"/>
<icon BUILTIN="bell"/>
<node CREATED="1594145665790" ID="ID_886314529" MODIFIED="1594145671826" TEXT="-aumentamos contador de usos">
<icon BUILTIN="button_cancel"/>
</node>
<node CREATED="1594145658230" ID="ID_111303606" LINK="#ID_1020360484" MODIFIED="1594145703001" TEXT="modificar modelo">
<icon BUILTIN="desktop_new"/>
<icon BUILTIN="bell"/>
<attribute_layout NAME_WIDTH="72" VALUE_WIDTH="130"/>
<attribute NAME="times" VALUE="**existe[0].times+1**"/>
</node>
<node CREATED="1553569481674" ID="ID_1103899655" MODIFIED="1594146578580" TEXT="extender &quot;resp&quot;">
<icon BUILTIN="desktop_new"/>
<icon BUILTIN="bell"/>
<attribute_layout NAME_WIDTH="80" VALUE_WIDTH="153"/>
<attribute NAME="error" VALUE="0"/>
<attribute NAME="mensaje" VALUE="ok, de cache"/>
<attribute NAME="data" VALUE="**existe[0].youtube_link**"/>
</node>
</node>
<node CREATED="1594145544002" ID="ID_1701214009" MODIFIED="1594145546452" TEXT="otra condicion">
<icon BUILTIN="help"/>
<node CREATED="1594145470470" ID="ID_1216442035" MODIFIED="1594145530444" TEXT="-obtenemos link de youtube">
<icon BUILTIN="button_cancel"/>
</node>
<node CREATED="1593839095004" ID="ID_1739037503" MODIFIED="1593839121966" TEXT="npm:instalar &quot;yt-search&quot;, yt">
<icon BUILTIN="desktop_new"/>
<attribute NAME="require" VALUE="true"/>
</node>
<node CREATED="1593839148397" ID="ID_1030983526" MODIFIED="1593839155773" TEXT="const search = promisify(yt);">
<icon BUILTIN="penguin"/>
</node>
<node CREATED="1593839222432" ID="ID_646141268" MODIFIED="1593839318731" TEXT="let youtubeLink = &apos;&apos;;">
<icon BUILTIN="penguin"/>
</node>
<node CREATED="1593839172650" ID="ID_180146120" MODIFIED="1593839178228" TEXT="probar">
<icon BUILTIN="broken-line"/>
<node CREATED="1593839192147" ID="ID_1897394592" MODIFIED="1593839194307" TEXT="error">
<icon BUILTIN="help"/>
<node CREATED="1593839199596" ID="ID_1526219834" MODIFIED="1593839346964" TEXT="hubo error consultando youtube">
<icon BUILTIN="clanbomber"/>
</node>
<node CREATED="1553569481674" ID="ID_439483078" MODIFIED="1593877616634" TEXT="extender &quot;resp&quot;">
<icon BUILTIN="desktop_new"/>
<attribute_layout NAME_WIDTH="113" VALUE_WIDTH="135"/>
<attribute NAME="error" VALUE="1"/>
<attribute NAME="mensaje" VALUE="error consultando youtube"/>
</node>
</node>
<node CREATED="1593839179462" ID="ID_588450823" MODIFIED="1593839232161" TEXT="result = await search(params.search_name);">
<icon BUILTIN="penguin"/>
</node>
<node CREATED="1593839268704" ID="ID_344177680" MODIFIED="1593839323906" TEXT="probar">
<icon BUILTIN="broken-line"/>
<node CREATED="1593839335979" ID="ID_159966729" MODIFIED="1593903529310" TEXT="error">
<icon BUILTIN="help"/>
<node CREATED="1593839199596" ID="ID_1139839832" MODIFIED="1593839216737" TEXT="sin resultados para: **params.search_name**">
<icon BUILTIN="clanbomber"/>
<icon BUILTIN="bell"/>
</node>
<node CREATED="1553569481674" ID="ID_1420075334" MODIFIED="1593877661155" TEXT="extender &quot;resp&quot;">
<icon BUILTIN="desktop_new"/>
<attribute_layout NAME_WIDTH="72" VALUE_WIDTH="138"/>
<attribute NAME="error" VALUE="2"/>
<attribute NAME="mensaje" VALUE="sin resultados para link"/>
</node>
</node>
<node CREATED="1593839272791" ID="ID_378971035" MODIFIED="1593839305118" TEXT="const [topResult] = result.videos;">
<icon BUILTIN="penguin"/>
</node>
<node CREATED="1593839300475" ID="ID_1758908329" MODIFIED="1593839672898" TEXT="youtubeLink = topResult.url;">
<icon BUILTIN="penguin"/>
</node>
<node CREATED="1553569481674" ID="ID_1094974448" MODIFIED="1593877640247" TEXT="extender &quot;resp&quot;">
<icon BUILTIN="desktop_new"/>
<icon BUILTIN="bell"/>
<attribute_layout NAME_WIDTH="113" VALUE_WIDTH="135"/>
<attribute NAME="error" VALUE="0"/>
<attribute NAME="mensaje" VALUE="ok"/>
<attribute NAME="data" VALUE="**youtubeLink**"/>
</node>
<node CREATED="1594145625274" ID="ID_1296485769" MODIFIED="1594145637288" TEXT="condicion si &quot;**youtubeLink**&quot; no esta vacio">
<icon BUILTIN="help"/>
<icon BUILTIN="bell"/>
<node CREATED="1594145638640" ID="ID_95047696" MODIFIED="1594145645585" TEXT="guardamos en cache si hay respuesta">
<icon BUILTIN="button_cancel"/>
</node>
<node CREATED="1594145560140" ID="ID_658852424" MODIFIED="1594145612448" TEXT="insertar modelo &quot;tracks&quot;">
<icon BUILTIN="desktop_new"/>
<icon BUILTIN="bell"/>
<attribute_layout NAME_WIDTH="109" VALUE_WIDTH="151"/>
<attribute NAME="search_query" VALUE="**params.search_name**"/>
<attribute NAME="youtube_link" VALUE="**youtubeLink**"/>
<attribute NAME="times" VALUE="1"/>
</node>
</node>
</node>
</node>
</node>
</node>
</node>
<node CREATED="1593664913451" FOLDED="true" ID="ID_1994350356" MODIFIED="1594312509963" TEXT="infoSesion">
<richcontent TYPE="NOTE"><html>
  <head>
    
  </head>
  <body>
    <p>
      Obtiene los datos asociados a la sesion dada. Para permitir re-obtener info de usuario para re-carga de datos en sesion compartida
    </p>
  </body>
</html></richcontent>
<attribute NAME="type" VALUE="POST"/>
<attribute NAME="params" VALUE="sesion*"/>
<attribute NAME="return" VALUE="resp"/>
<node CREATED="1593664917617" ID="ID_1435474987" MODIFIED="1593664927572" TEXT="condicion si falta parametro &quot;*&quot;">
<icon BUILTIN="help"/>
<node CREATED="1553569481674" ID="ID_1780266987" MODIFIED="1553569481674" TEXT="struct, resp">
<icon BUILTIN="desktop_new"/>
<attribute_layout NAME_WIDTH="68" VALUE_WIDTH="106"/>
<attribute NAME="error" VALUE="400"/>
<attribute NAME="mensaje" VALUE="falta parametro"/>
</node>
</node>
<node CREATED="1593664924464" ID="ID_1714146219" MODIFIED="1594146858722" TEXT="otra condicion">
<icon BUILTIN="help"/>
<node CREATED="1594145166135" ID="ID_687750216" MODIFIED="1594167811836" TEXT="consultar modelo &quot;users&quot;, existe">
<icon BUILTIN="desktop_new"/>
<icon BUILTIN="bell"/>
<attribute_layout NAME_WIDTH="60" VALUE_WIDTH="117"/>
<attribute NAME="sesion" VALUE="**params.sesion**"/>
</node>
<node CREATED="1594166573985" ID="ID_1814595707" MODIFIED="1594166583590" TEXT="condicion si &quot;**existe**&quot; contiene registros">
<icon BUILTIN="help"/>
<icon BUILTIN="bell"/>
<node CREATED="1553569481674" ID="ID_758209816" MODIFIED="1594166624034" TEXT="struct, resp">
<icon BUILTIN="desktop_new"/>
<icon BUILTIN="bell"/>
<attribute_layout NAME_WIDTH="68" VALUE_WIDTH="106"/>
<attribute NAME="error" VALUE="0"/>
<attribute NAME="mensaje" VALUE="ok"/>
<attribute NAME="data" VALUE="**existe[0]**"/>
</node>
</node>
<node CREATED="1594166583907" ID="ID_1180254165" MODIFIED="1594166586909" TEXT="otra condicion">
<icon BUILTIN="help"/>
<node CREATED="1553569481674" ID="ID_1159278893" MODIFIED="1594167815662" TEXT="struct, resp">
<icon BUILTIN="desktop_new"/>
<attribute_layout NAME_WIDTH="68" VALUE_WIDTH="106"/>
<attribute NAME="error" VALUE="100"/>
<attribute NAME="mensaje" VALUE="invalid sesion"/>
</node>
</node>
</node>
</node>
</node>
</node>
</map>
