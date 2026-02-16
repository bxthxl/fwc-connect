
-- ============================================
-- 1. BRANCHES TABLE
-- ============================================
CREATE TABLE public.branches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  address TEXT,
  pastor_name TEXT,
  pastor_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read branches" ON public.branches
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage branches" ON public.branches
  FOR ALL USING (is_admin(auth.uid()));

-- ============================================
-- 2. CHURCH ROLES TABLE
-- ============================================
CREATE TABLE public.church_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.church_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read church roles" ON public.church_roles
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage church roles" ON public.church_roles
  FOR ALL USING (is_admin(auth.uid()));

-- Seed church roles
INSERT INTO public.church_roles (name) VALUES
  ('Protectionist'),
  ('Worship Leader'),
  ('Wardrobe Team'),
  ('EDC Team'),
  ('Music Development'),
  ('Team Secretariat'),
  ('Pastor'),
  ('Deacon'),
  ('Branch Lead'),
  ('Prayer Team');

-- ============================================
-- 3. MEMBER CHURCH ROLES JUNCTION TABLE
-- ============================================
CREATE TABLE public.member_church_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  church_role_id UUID NOT NULL REFERENCES public.church_roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(profile_id, church_role_id)
);

ALTER TABLE public.member_church_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read member church roles" ON public.member_church_roles
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own church roles" ON public.member_church_roles
  FOR INSERT WITH CHECK (profile_id = get_profile_id(auth.uid()));

CREATE POLICY "Users can delete own church roles" ON public.member_church_roles
  FOR DELETE USING (profile_id = get_profile_id(auth.uid()));

CREATE POLICY "Admins can manage all member church roles" ON public.member_church_roles
  FOR ALL USING (is_admin(auth.uid()));

-- ============================================
-- 4. ADD branch_id TO PROFILES
-- ============================================
ALTER TABLE public.profiles ADD COLUMN branch_id UUID REFERENCES public.branches(id);

-- ============================================
-- 5. ADD branch_id TO MEETINGS
-- ============================================
ALTER TABLE public.meetings ADD COLUMN branch_id UUID REFERENCES public.branches(id);

-- ============================================
-- 6. ADD branch_id TO ANNOUNCEMENTS
-- ============================================
ALTER TABLE public.announcements ADD COLUMN branch_id UUID REFERENCES public.branches(id);

-- ============================================
-- 7. EVENTS TABLE
-- ============================================
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  location TEXT NOT NULL,
  dress_code TEXT,
  branch_id UUID REFERENCES public.branches(id),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read events" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Admins can create events" ON public.events
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update events" ON public.events
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete events" ON public.events
  FOR DELETE USING (is_admin(auth.uid()));

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 8. EVENT BGVs JUNCTION TABLE
-- ============================================
CREATE TABLE public.event_bgvs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, member_id)
);

ALTER TABLE public.event_bgvs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read event bgvs" ON public.event_bgvs
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage event bgvs" ON public.event_bgvs
  FOR ALL USING (is_admin(auth.uid()));

-- ============================================
-- 9. HELPER FUNCTION: get_user_branch_id
-- ============================================
CREATE OR REPLACE FUNCTION public.get_user_branch_id(auth_uid UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT branch_id FROM public.profiles WHERE auth_user_id = auth_uid LIMIT 1
$$;

-- ============================================
-- 10. SEED ALL BRANCHES
-- ============================================
INSERT INTO public.branches (name, address, pastor_name, pastor_phone) VALUES
  ('FWC Aba', '134, Okigwe Road, Aba, Abia State.', 'Emeka Agwu', '234 703 935 0603'),
  ('FWC Abaji', 'No 49b, Federal Low-Cost Housing Estate, Abaji-Abuja.', 'Kelechi Fabian Nwokpor', '234 708 322 0360'),
  ('FWC Abakaliki', 'Sports Bar section Salt Spring Resort, opposite Roban Stores Mile 50 Rd, Abakaliki', 'Ikedi Peace', '234 810 982 5623'),
  ('FWC Abeokuta', 'Dolly House, by Opay Office, opposite Laroy Hotel, Abiola Way, Abeokuta, Ogun State.', 'Adeoye Oluwasegun Godfrey', '234 803 344 2646'),
  ('FWC Ado Ekiti', 'First floor PEP building, Bank Road, Ado Ekiti.', 'Clement Obi', '234 703 515 2696'),
  ('FWC Agbor', 'No 225 Old Lagos/Asaba Road Agbor Delta State.', 'Otor Solomon Matthew', '234 809 726 7715'),
  ('FWC Akure', '31 Falodun Street, Opposite Gas Plant, Commercial Junction, Oke-Aro, Akure', 'Daniel Kpirhe', '234 811 122 2807'),
  ('FWC Akwanga', 'Jinji Hotels, Along Jos Road, Akwanga.', 'Sunday John Chuks', '234 806 624 7080'),
  ('FWC Aleita', 'Abuja Chamber of Commerce & Industry, Next building after Shoprite, Airport Road', 'Beauty Lawrence', '234 705 647 7905'),
  ('FWC Ankpa', 'Nulge Hall, Behind the Local Govt Secretariat, Ankpa, Kogi State.', 'Aondoakaa Victor Terseer', '234 701 823 7449'),
  ('FWC Apo', 'Merit Hall, 3RD Floor, Apo Resettlement, Opposite AMAC secretariat', 'Marshal Jagaba', '234 803 224 7817'),
  ('FWC Asaba', 'Asaba Amaka Plaza, directly behind the State Secretariat, Off Okpanam Road, Asaba', 'Ogbu Brown', '234 803 601 1674'),
  ('FWC Aso 1', 'Cornerstone Academy, Behind Vita Camp, Aso A, Nasarawa State.', 'Rachael Agbo', '234 806 158 5262'),
  ('FWC Aso 2', 'The Lords Way Academy, Aso B Mararaba, Nasarawa State', 'Tyoer Joseph', '234 806 781 5079'),
  ('FWC Asokoro', 'Asokoro Community Staff School, No. 29, Maitama Sule Street, Asokoro, Abuja.', 'Mike Olorundare', '234 703 098 1909'),
  ('FWC Auchi', 'Moore Boulevard Hotel, Alhaji Abas Street Jattu-Auchi, Edo State.', 'Anako Joseph', '234 805 111 5035'),
  ('FWC Awka', 'Westend Plaza, Opposite Benjamin Hotels, Aroma, Awka, Anambra State', 'Omefe Ifeanyi Michael', '234 816 127 7784'),
  ('FWC Ayingba', 'Barr. Tanko street, Behind high Court, Anyigba Kogi State.', 'Joseph Musa', '234 907 609 1180'),
  ('FWC Bauchi', 'Gidan Abba Events Center, Adjacent Saint Piere Gas Station, Sabon Dapel Lengkat Kaura', 'Dapel Lengkat', '234 703 497 2269'),
  ('FWC Benin', 'The Cartharium Event Centre, No 17 Upper, Adesuwa Road GRA Benin City.', 'Victor Kadiri', '234 802 367 4506'),
  ('FWC Billiri', 'Beside Former Larobit Clinic, Along ECWA 1 Road, Billiri, Gombe State', 'Paul Oche Solomon', '234 803 964 1066'),
  ('FWC Birnin Kebbi', 'Badariya, church layout Birnin kebbi.', 'Andrew Danjuma', '234 705 927 0428'),
  ('FWC Bonny Island', 'The Promise Restaurant and Event Centre, New Road, Bonny, Rivers State.', 'Dogo Jeremiah David', '234 813 139 2596'),
  ('FWC Bwari', 'Adjacent Deeper Life Junction, besides NIPCO GAS Station, Bwari, Abuja.', 'Apeh Anthony', '234 803 627 1340'),
  ('FWC Calabar', 'Pepperoni Complex Hall, 151 Ndidem Usang Iso, By Efio-Ete junction, Calabar.', 'Peter Eba', '234 703 466 4860'),
  ('FWC Dakwa', 'China Market, Sir S.Y. Iyodo Street, Behind Ik Gas, Dakwa, Abuja', 'Obiatuegwu Chigozie JP', '234 816 741 4939'),
  ('FWC Damaturu', 'New Jerusalem Street, Behind Glad School, Damaturu Yobe State', 'Ephraim Tyokua', '234 813 654 5357'),
  ('FWC Dawaki', 'By Citi Polytechnic, Plot 182 Hill Side Extension Dutse-Dawaki Road, Abuja', 'Akin Tanimowo', '234 805 533 8007'),
  ('FWC Dutse', 'Gregold/D''queen Event Centre, Opposite VONO PLAZA, FO1 Layout, Kubwa Abuja', 'Prince Michael Aweh', '234 818 803 2343'),
  ('FWC Dutse (Jigawa)', 'Jigawa State', 'Williams Ijakoli', '234 803 757 5665'),
  ('FWC Eket', '103, Afaha Uqua Road, off Eket-Oron Road, Eket, AKS.', 'Odey Hilary Agabi', '234 816 493 4824'),
  ('FWC Enugu 1', 'No 2 Ezeweputa Crescent, off 2nd Avenue, Independence layout, Enugu.', 'Fred Uyanwune', '234 905 115 3024'),
  ('FWC Enugu 2', 'Akunwata Mall, #103 Agbani Road, Beside Roban Stores, Enugu', 'Ezeukwu Ramsey Elochukwu', '234 803 750 2053'),
  ('FWC Garki 2', 'Blake Excellence Resort, plot 50 Ahamdu Bello Way, Garki 2', 'Malik Ugoala', '234 803 315 5415'),
  ('FWC Gashua', 'Behind Mobile Base, along Yusufari Road Gashua.', 'Bulus Jabani Shidas', '234 803 649 4950'),
  ('FWC Gboko', 'No 75, Captain Dawn Road, Adekaa, Gboko, Benue state', 'Samuel Tarzaa', '234 807 663 9851'),
  ('FWC Gombe', 'Cactus Hotel, Shongo Estate, Gombe-Bauchi Road, Gombe', 'Kwaghzer', '234 806 796 4142'),
  ('FWC Gosa', 'Best Budget hotel, ACO/AMAC ESTATE, Airport Road, Abuja', 'Brown Iferi', '234 803 711 2197'),
  ('FWC Gudu', 'Royal Family Resort, Plot 848C, B14 beside DIFF Hospital, Gudu District, Abuja.', 'Steve Oricha', '234 803 317 3481'),
  ('FWC Gusau', 'Behind JAIZ Hotel, Express by-pass, Gusau, Zamfara State', 'Mando Clement', '234 803 291 3168'),
  ('FWC Gwagwalada 1', 'After UATH opposite Resuscitate Hospital, Before Passo Junction, Gwagwalada', 'Emmanuel Danladi', '234 816 945 8281'),
  ('FWC Gwagwalada 2', 'Opposite Jibeco filling station, Angwan dodo, Gwagwalada, Abuja.', 'Ayodeji Aroluyo', '234 703 936 5769'),
  ('FWC Gwandara', 'Nyanya Gwandara Downtown by Banu Lodge', 'Nwakwesi Godwin', '234 813 979 3937'),
  ('FWC Gwarinpa 1', 'Stanzel Grand Resort, Plot C103, off 1st Avenue behind Fidelity bank, Gwarinpa estate.', 'Chukwuemeka Nweke', '234 803 592 6476'),
  ('FWC Gwarinpa 2', 'AGC Hotel plot 1005, 69A road off 69 road Gwarinpa', 'Ati Ladan', '234 802 817 0404'),
  ('FWC Ibadan', 'Top Floor, Jonik Complex, Near Queen Cinema, Dugbe, Ibadan.', 'Bamidele Aloko', '234 701 951 9554'),
  ('FWC Idah', 'Directly Opposite Government Technical School G.R.A. IDAH', 'Agber Richard', '234 807 275 4686'),
  ('FWC Iddo', 'Leisure Apartment, off Iddo inside road, off University of Abuja-Airport Express way, Iddo.', 'Masi Ogranya Charles', '234 808 905 1223'),
  ('FWC Ikom', 'Hotel De Genesi & Garden, 41 Border Road, Ikom', 'Imasa Cletus Okeje', '234 703 833 4865'),
  ('FWC Ile-Ife', 'Ilaramokin Hall, Iloromu, before Ambassadors College, Ile-Ife', 'Folorunso Abiodun James', '234 806 860 6879'),
  ('FWC Ilorin', 'Abdulaziz Atta Memorial School, off Fate Road, Ilorin', 'Amana Timothy', '234 803 935 9087'),
  ('FWC Imane', 'Ojidokoele Imane, Olamaboro, Kogi State', 'Enogiasun Monday Elo', '234 703 656 4257'),
  ('FWC Jahi', 'GCC Hub, Plot 491, Kado, behind Deeper Life School, Kado.', 'John Otarakpo', '234 816 872 7572'),
  ('FWC Jalingo', 'DSK Foundation, Hamaruwa Way Jalingo, By Fidelity Bank.', 'James Samuel Funom', '234 813 214 9743'),
  ('FWC Jikwoyi', 'DE-Directors Hotel and Suites, opposite Mobil Filling Station, Jikwoyi.', 'Innocent Dauda', '234 803 697 6391'),
  ('FWC Jos 1', 'Nigeria Bible Translation Trust, No 7 Old Airport Road, Jos Plateau State', 'Peter Ameh', '234 803 559 4059'),
  ('FWC Jos 2 - Zaria Road', 'Opposite St. Murumbas College, behind Ortnate Pavilion event Centre', 'Favor Torsar', '234 803 095 3274'),
  ('FWC Jos 3 - Bukuru', 'Yelwa Club, 1 Rayfield Road, Bukuru, Jos, Plateau', 'Attama Victor Chinedu', '234 803 772 3051'),
  ('FWC Kabusa', 'Sharetti Before Wazobia Hospital Kabusa', 'Odeke Bernard', '234 803 815 7395'),
  ('FWC Kaduna 1', 'No. 6 Tanko Ayuba Road, Narayi, High Cost, Kaduna State.', 'Lawrence Clark', '234 818 327 4147'),
  ('FWC Kaduna 2 - Sabo', 'No. 58, KM 10, Kachia Road, behind CLAYPOT, Sabo, Kaduna.', 'Rex Gbangban', '234 817 288 5695'),
  ('FWC Kaduna 3 - Gonin-Gora', 'No. 18 Sir Gbagy Road, Angwan Bijeh, Gonin-Gora Kaduna State', 'Ebubedike Kelechi', '234 803 329 6116'),
  ('FWC Kaduna 4 - Yakowa Road', 'No.1 Engr. Seth Bakut Cresent, Mahuta, Off Patrick Yakowa Road, Kaduna State', 'Katdep Nantip', '234 706 973 8781'),
  ('FWC Kafanchan', 'Bada Hall No. 9 Hospital Road, Kafanchan.', 'Benjamin Melar', '234 806 597 1785'),
  ('FWC Kano', '52 Aitken Road, Sabon Gari, Kano.', 'Austin Ikpechi', '234 803 230 2126'),
  ('FWC Karsana', 'Kelson International School, block A, 15a, Saraha Estate, Kafe district', 'Moses Christopher', '234 805 413 7236'),
  ('FWC Karshi', 'Goodness Plaza Karshi by-pass.', 'Rick Edward', '234 806 153 9064'),
  ('FWC Karu', 'Corteland Garden, opposite Karu Chiefs Palace, Karu, Abuja', 'Smith Aghama', '234 802 711 0458'),
  ('FWC Katsina', 'Mezian Luxury Suite, Behind First Bank, Tudun Katsira Street.', 'Iliya Lai Adamu', '234 807 474 7773'),
  ('FWC Katsina-Ala', 'Former Better Life Micro Finance Bank Building, Beside First Bank, Katsina-Ala.', 'Ukpough Sunday', '234 816 495 8385'),
  ('FWC Keffi', 'Otunsha Hotel New Prison Road, Dadin Kowa, Keffi', 'Kwasu Caleb', '234 802 865 5527'),
  ('FWC Ketti', 'House 12B, Zone 2, adjacent Catholic Church, Ketti', 'Osiaje Paul', '234 805 508 4935'),
  ('FWC Kubwa 1', 'Plot 414, Liberty Road, Opposite mango tree junction, Kubwa.', 'Simon Odoh', '234 803 083 3028'),
  ('FWC Kubwa 2', 'Onward Multipurpose Centre, PW, by Maroko, Kubwa', 'Iyana Gabriel', '234 803 453 1757'),
  ('FWC Kubwa 3 - Byazhin', 'No. 1, Scripture Foundation Street, Opposite Living Faith Church, Chikakore, Abuja', 'Ikechukwu Odozor', '234 703 194 8138'),
  ('FWC Kuchikau', 'Elim Top Suites Hotel, Hara Foam Junction Kuchikau, Keffi-Abuja', 'Inyang Iyakise', '234 809 114 4001'),
  ('FWC Kuduru', 'De-Gopherwood Montessori School, Along Kuduru Road, Kuduru, Abuja', 'Chuks Onubogu', '234 703 300 5070'),
  ('FWC Kuje 1', 'Daponic Hotel, AA3 Layout adjacent new tipper garage Kuje, Abuja', 'James Avong', '234 803 649 1166'),
  ('FWC Kuje 2 - Pegi', 'Triumphant Kids Intl College Road, Zone C, 1000 Unit, Pegi, Kuje', 'Alred Nuvie', '234 903 349 8820'),
  ('FWC Kurudu', 'Lavogue British International Schools, Plot 25/26 Kurudu Commercial Layout, Kurudu.', 'Ezekiel Dauda', '234 805 243 2374'),
  ('FWC Kwali', 'Beside Kwali Sports Stadium, Overseas Quarters, Kwali', 'Isama Peter Oko', '234 703 680 5867'),
  ('FWC Lafia', 'Manyi Royal Suites Jos Rd, Bukan Sidi, Lafia', 'Gideon Banda', '234 812 566 8307'),
  ('FWC Lagos 1 - Ikeja', 'Viva Cinemas Ikeja, Jara Mall, 22 Simbiat Abiola Way, Ikeja, Lagos.', 'Joseph Dalee Bok', '234 803 689 8047'),
  ('FWC Lagos 2 - Ajah', 'De Dreams hotel, Sangotedo, Lekki-Epe expressway, Lagos.', 'Sunday Ekpa', '234 706 933 9665'),
  ('FWC Lagos 3 - Festac', 'Lotus Kitchen, Before 101 junction FESTAC Town Lagos.', 'Okoro Stephen', '234 809 438 1631'),
  ('FWC Lagos 4 - Badagry', 'Maupe Hall, 10 Samuel Ekundayo Road, Badagry, Lagos', 'Sola Padonu', '234 806 153 0467'),
  ('FWC Lagos 5 - Ibeju-Lekki', 'The Myriad Mall, Km 51 Lekki Express Way, Ibeju Lekki, Lagos State', 'Nwogbo Ejike', '234 701 451 0851'),
  ('FWC Lagos 6 - Ikorodu', 'Hezekiah Hall, Destiny Castle Hotel, Ikorodu', 'Attah Ojodomo', '234 703 715 2166'),
  ('FWC Lagos 7 - Ikotun', '194, Ikotun Road, Calvary BRT Bus Stop, Ikotun, Lagos.', 'Joseph Adie', '234 806 451 6072'),
  ('FWC Lagos 8 - Iyana Iba', 'Obietrice Complex, Great Challenge Road, Unity Estate, Iba, Lagos', 'Obi-Dinwawor', '234 703 565 1154'),
  ('FWC Lagos 9 - Surulere', 'Yewande Memorial School, Off Ogunlana Drive Surulere Lagos.', 'Adegbola Ayodeji', '234 806 760 0511'),
  ('FWC Langtang', 'Tim Tali Motel, Along Wase Road, Pajat, Langtang', 'Timothy Foreman', '234 708 021 1484'),
  ('FWC Life Camp', 'Last floor, Mountview Plaza, Road opposite the Catholic Church, Lifecamp.', 'Sunny Ekunwe', '234 802 255 2284'),
  ('FWC Lokogoma 1', 'Daisies Academy, Plot 78 Cadastral Zone C08, Dakwo, Abuja', 'Nduka Achumba', '234 813 358 8017'),
  ('FWC Lokogoma 2', 'Vatan Plaza, Close to Lokogoma Junction, Abuja', 'Isowo Smart', '234 909 339 4843'),
  ('FWC Lokoja', 'By NNPC Filling Station, along Ganaja village road, Lokoja.', 'Eteng Ebri', '234 805 527 4224'),
  ('FWC Lugbe 1', 'Salem Academy, FHA, Lugbe. Plot 4043 Cadastral Zone', 'Jide Ogunsi', '234 802 313 8572'),
  ('FWC Lugbe 2', 'E30 Along Jedo Estate Road, Airport Road, Abuja.', 'Alfred Nyako', '234 803 876 0332'),
  ('FWC Lugbe 3', 'Excellent Way Academy, Phase 3 Trademore Estate.', 'Emmanuel Sani', '234 803 706 2895'),
  ('FWC Lugbe 4', 'Progress Dynamic International Academy, Penthouse Estate Lugbe', 'Grant Ukorji', '234 816 619 2754'),
  ('FWC Maiduguri', 'Command Guest House, Baga Road, Beside Maimalari Barracks, Maiduguri.', 'Dennis Kazachiang', '234 703 036 2900'),
  ('FWC Makurdi', 'Beside BIPC Head Office, New Otukpo Road, Makurdi, Benue State.', 'Chris Etuh', '234 909 297 2477'),
  ('FWC Mararaba', '9 Sule Adanu Street, Abacha Road, Mararaba, Karu.', 'Steve Amodu', '234 706 177 0351'),
  ('FWC Masaka', 'Before Tipper Garage Luvu Road, Area One, Masaka', 'Alex Ayuba', '234 806 550 6855'),
  ('FWC Mbora-Idu', 'Lefiness Events Centre, Idu Industrial layout, opposite Efab Global Estate', 'Essien Akparawa', '234 803 600 9451'),
  ('FWC Minna', 'Sauka kahuta Mandela Road, Minna, Niger State', 'Peter Awough', '234 708 152 3289'),
  ('FWC Mpape', 'Amman Plaza, opposite Chicken Republic, Mpape.', 'Emmanuel Jackson', '234 803 315 5857'),
  ('FWC Nasara Eggon', 'Alheri Ayi Hotel, Off Madda Station Road, Nasarawa Eggon', 'Ukertyo Clement', '234 805 733 1196'),
  ('FWC Nasarawa', 'Nasarawa', 'Etsegbe Sunny', '234 805 508 4171'),
  ('FWC New Nyanya', 'Trust Academy School Hall Plot 56, Karu GRA Layout Phase 1, New Nyanya', 'Friday Onwuka', '234 802 375 1624'),
  ('FWC Nnewi', 'No. 127 Old Onitsha/Oba/Ibeto Road, Nnewi.', 'Okafor Michael', '234 803 663 9075'),
  ('FWC Nsukka', 'Plot 2 Echara Road, Off Enugu Road, Nsukka, Enugu State', 'Bethel Akobundu', '234 803 212 7206'),
  ('FWC Numan', 'LOJEF Garden Jalingo Road, Numan, Adamawa State', 'Fredrick Francis', '234 805 641 5498'),
  ('FWC Nyanya', 'DIATO Hotel, Area C, behind Mopol Quater Guard, Nyanya.', 'Michael Adeniyi', '234 803 452 4837'),
  ('FWC Oju', 'Behind PEEPET Filling Station, Ogengeng PHASE 1, Oju L.G.A. Benue State.', 'Iwuji Cyracus', '234 802 881 7404'),
  ('FWC Okigwe', 'De Faimackus Bloomy Hotel Ltd, No 42 Umuchima Road Okigwe Imo State.', 'Okoye Samuel', '234 803 978 4759'),
  ('FWC Okrika', 'Abere Plaza, Abam Road, Okrika, River State.', 'Attah Peter', '234 706 506 7823'),
  ('FWC Onitsha', 'No 52/99A, Port Harcourt Road, Fegge, Onitsha, Anambra State.', 'Michael Nzekwe', '234 813 747 2119'),
  ('FWC Orozo', 'Mukasdanga Hall, Yuby Resort, Navy Estate Road, Orozo.', 'Tor Anandeh', '234 805 212 1236'),
  ('FWC Oshogbo', 'No.7, Akindeko street, Alekuwodu Market Osogbo, Osun State.', 'Bright Amodu', '234 806 558 5965'),
  ('FWC Ota', 'No. 28 Akinwunmi street, Joju junction, Ota', 'Samuel Terngu', '234 706 312 8603'),
  ('FWC Otukpo', 'Maximum Hotel, Eyupi, Otukpo', 'Enemona Peter', '234 810 188 0692'),
  ('FWC Owerri', 'No. 54 Onitsha Road, opposite Arugo park, Owerri.', 'Obinna Agbakwuru', '234 803 554 6039'),
  ('FWC Oyo Town', 'Adeasakin House, Abiodun Attiba Road, Idi-Ope, Oyo.', 'Clifford Ashemuke', '234 803 643 5899'),
  ('FWC Panshin', 'Kajola Cooperative Hall, Pankshin.', 'Timothy Sunny Zibai', '234 803 700 3581'),
  ('FWC Port Harcourt 1', '90 Aba Road, opposite crafts center bus stop, Port Harcourt', 'Paul Otseakemhe', '234 703 085 5673'),
  ('FWC Port Harcourt 2 - Elelenwo', 'Oro Jesus Plaza No 222 Old Refinary Road, Elelenwo, Port Harcourt.', 'Bernard Okoro', '234 806 229 9097'),
  ('FWC Potiskum', 'Shagari Low Cost, House No 106, Potiskum, Yobe State.', 'Agida Dickson Usman', '234 803 076 4478'),
  ('FWC Sokoto', 'McDonald Restaurant East/West Bypass, Tamaje Road Sokoto.', 'Nwoka Peter Ofoke', '234 802 857 4059'),
  ('FWC Suleja', 'Nazareth Hall, opposite Murga Oil & Gas, Kwata, Niger State', 'Sunday Iyamba', '234 807 959 2814'),
  ('FWC Suleja 2', 'Zion multipurpose hall, Power line Gauraka, Kaduna Road.', 'Norbert Ilo', '234 803 601 4468'),
  ('FWC Tungan-Maje', 'Ocho Guest Inn near MTN mast, Tungan Maje', 'Ola-Benson Folayemi Evelyn', '234 808 186 3658'),
  ('FWC Ughelli', 'Ikprukpru Hall, Off Uloho Avenue, Ughelli, Delta State', 'Patrick Nathaniel', '234 810 072 3072'),
  ('FWC Uke', 'Forest Hill Resort, Km 21, Keffi-Abuja Express Way', 'Ogayi Samuel Igiri', '234 803 080 1090'),
  ('FWC Umuahia', 'Wonderland Event Center, Isi-court Umuahia.', 'Emmanuel Chima', '234 703 056 3806'),
  ('FWC Ushafa', '2nd floor, Detyms Plaza by SCC Junction, Ushafa', 'John Mark', '234 806 907 1697'),
  ('FWC Uyo', 'No. 217 Oron Road, 2nd Floor, adjacent Zenith Bank, Uyo, Akwa Ibom State.', 'Jimmy Clement Etuk', '234 703 123 3488'),
  ('FWC Vandeikya', 'No. 7 Murtala Muhammed Street, Vandeikya.', 'Oliver Ikyowe', '234 806 126 4955'),
  ('FWC Warri', 'No. 23 Deco Road, 2nd Floor, Warri, Delta State', 'George Momoh', '234 805 555 8584'),
  ('FWC Wukari', 'Elizabeth Center, Missions Quarter, Wukari', 'David Izam', '234 809 686 0139'),
  ('FWC Wumba', 'White house hotel, by 2nd transformer, Wumba, Apo Abuja.', 'Ernest Amodu', '234 703 035 6673'),
  ('FWC Wuye', 'Royal Family Academy Auditorium, Plot 648 Gidado Idris Way, Wuye District, Abuja.', 'Wilson Akubo', '234 803 322 1239'),
  ('FWC Yenagoa', 'Plot 691, Mbiama/Yenagoa Road, Yenagoa, Bayelsa State.', 'Uzodimma', '234 803 501 1725'),
  ('FWC Yola', 'No. 2 Jerusalem Avenue, behind CBN/UBA, Jimeta-Yola.', 'Daniel Ojonimi', '234 805 343 5923'),
  ('FWC Zuba', 'Favoured Destinies Montessori Academy, Ikwa, Zuba.', 'Oyinu Moses', '234 908 099 6061'),
  ('FWC Zuru', 'Zuru multipurpose cooperative hall, Ahmadu Bello Way, Jarkasa, Zuru, Kebbi State', 'Ibrahim Rabo', '234 907 333 3943');
