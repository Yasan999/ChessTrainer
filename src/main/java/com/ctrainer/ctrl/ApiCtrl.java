package com.ctrainer.ctrl;

import com.ctrainer.model.Res;
import com.ctrainer.model.Usr;
import com.ctrainer.repo.ResRepo;
import com.ctrainer.repo.UsrRepo;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.transaction.Transactional;

@RestController
@RequestMapping("/api")
public class ApiCtrl {

    private final UsrRepo urp;
    private final ResRepo rrp;
    private final PasswordEncoder pwe;

    public ApiCtrl(UsrRepo urp, ResRepo rrp, PasswordEncoder pwe) {
        this.urp = urp;
        this.rrp = rrp;
        this.pwe = pwe;
    }

    @PostMapping("/reg")
    public ResponseEntity<Usr> reg(@RequestBody Usr u) {
        if (urp.findByNick(u.getNick()).isPresent()) { return new ResponseEntity<>(HttpStatus.CONFLICT); }
        u.setPwd(pwe.encode(u.getPwd()));
        Usr svd = urp.save(u);
        return new ResponseEntity<>(svd, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<Usr> login(@RequestBody Map<String, String> crd) {
        Optional<Usr> o = urp.findByNick(crd.get("nick"));
        if (o.isPresent()) { Usr u = o.get(); if (pwe.matches(crd.get("pwd"), u.getPwd())) { return new ResponseEntity<>(u, HttpStatus.OK); } }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }
    
    @GetMapping("/usr/{uid}")
    public ResponseEntity<Usr> getUsr(@PathVariable Long uid) { return urp.findById(uid).map(u -> new ResponseEntity<>(u, HttpStatus.OK)).orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND)); }

    @PostMapping("/usr/{uid}/bg")
    public ResponseEntity<Void> updateBg(@PathVariable Long uid, @RequestBody Map<String, String> pld) {
        Optional<Usr> o = urp.findById(uid);
        if (o.isPresent()) { Usr u = o.get(); u.setBg(pld.get("bg")); urp.save(u); return new ResponseEntity<>(HttpStatus.OK); }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping("/res")
    public Res saveRes(@RequestBody Map<String, Object> pld) {
        Res r = new Res(); r.setUid(Long.parseLong(pld.get("uid").toString())); r.setScr(Integer.parseInt(pld.get("scr").toString())); r.setMod(pld.get("mod").toString()); r.setTs(LocalDateTime.now());
        return rrp.save(r);
    }

    @GetMapping("/prof/{uid}")
    public List<Res> getProf(@PathVariable Long uid) { return rrp.findByUidOrderByTsDesc(uid); }
    
    @GetMapping("/all")
    public List<Map<String, Object>> getAllUsersWithStats() {
        List<Usr> us = urp.findAll().stream().filter(u -> u.getNick() != null && !u.getNick().isEmpty() && u.getPwd() != null && !u.getPwd().isEmpty()).collect(Collectors.toList());
        List<Res> ars = rrp.findAll();
        Map<Long, List<Res>> rbm = ars.stream().collect(Collectors.groupingBy(Res::getUid));
        return us.stream().map(u -> { Map<String, Object> ump = new HashMap<>(); ump.put("user", u); ump.put("results", rbm.getOrDefault(u.getId(), new ArrayList<>())); return ump; }).collect(Collectors.toList());
    }

    @PostMapping("/usr/{uid}/fio")
    public ResponseEntity<Void> updateFio(@PathVariable Long uid, @RequestBody Map<String, String> pld) {
        return urp.findById(uid).map(u -> { u.setFio(pld.get("fio")); urp.save(u); return new ResponseEntity<Void>(HttpStatus.OK); }).orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/usr/{uid}/pwd")
    public ResponseEntity<Void> updatePwd(@PathVariable Long uid, @RequestBody Map<String, String> pld) {
        return urp.findById(uid).map(u -> { u.setPwd(pwe.encode(pld.get("pwd"))); urp.save(u); return new ResponseEntity<Void>(HttpStatus.OK); }).orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/usr/{uid}")
    @Transactional
    public ResponseEntity<Void> deleteUser(@PathVariable Long uid) {
        if (urp.existsById(uid)) { rrp.deleteByUid(uid); urp.deleteById(uid); return new ResponseEntity<>(HttpStatus.OK); }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}